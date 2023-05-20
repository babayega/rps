// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract RPS {
    //
    // MODIFIERS
    //
    modifier notAlreadyRegistered() {
        require(
            msg.sender != firstPlayer && msg.sender != secondPlayer,
            "already registered"
        );
        _;
    }

    modifier nonReentrant() {
        require(entered == false, "RPS: reentrant call");
        entered = true;
        _;
        entered = false;
    }

    //
    // Enums
    //
    enum Move {
        Empty,
        Rock,
        Paper,
        Scissor
    }

    enum Result {
        None,
        FirstPlayer,
        SecondPlayer,
        Draw
    }

    //
    // Constants
    //
    uint256 public constant BETTING_AMOUNT = 1e15; // 0.001
    uint256 public constant COMMISION = 50; // 50%
    uint256 public constant BLOCK_LIMIT = 200;

    /// @notice Address of the first registered player
    address payable firstPlayer;

    /// @notice Address of the first registered player
    address payable secondPlayer;

    /// @notice Choice of the first player hashed with sha256
    bytes32 private firstPlayerHash;

    /// @notice Choice of the second player hashed with sha256
    bytes32 private secondPlayerHash;

    /// @notice Block number at which current round started
    uint256 private firstRegisterBlock;

    /// @notice Move of the first player after revealing
    Move public firstPlayerChoice = Move.Empty;

    /// @notice Move of the first player after revealing
    Move public secondPlayerChoice = Move.Empty;

    /// @notice Bool to identify whether the game has ended
    bool gameEnded = false;

    /// @notice Bool to identify whether the result has been declared
    bool resultDeclared = false;

    /// @notice Bool to identify whether the function is already entered
    bool private entered = false;

    /// @notice Resets the values of the round after result declaration
    function resetAll() public {
        require(gameEnded && resultDeclared);

        firstPlayerHash = 0x0;
        secondPlayerHash = 0x0;
        firstPlayerChoice = Move.Empty;
        secondPlayerChoice = Move.Empty;
        gameEnded = false;
        resultDeclared = false;
    }

    /// @notice Register as a player for the new round, a betting amount is necessary
    function register() public payable notAlreadyRegistered {
        require(msg.value == 1e15, "please pay the betting amount");

        if (firstPlayer == address(0x0)) {
            firstPlayer = payable(msg.sender);
            firstRegisterBlock = block.number;
        } else {
            require(secondPlayer == address(0x0), "both players registered");
            secondPlayer = payable(msg.sender);
        }
    }

    /**
     * @notice Commit the choice (Rock / Paper / Scissor) by the player
     * @param hash is the hash of the choice made by the player
     */
    function commitChoice(bytes32 hash) public payable {
        if (msg.sender == firstPlayer && firstPlayerHash == 0x0) {
            firstPlayerHash = hash;
        } else if (msg.sender == secondPlayer && secondPlayerHash == 0x0) {
            secondPlayerHash = hash;
        } else {
            revert("invalid player or move registered");
        }
    }

    /**
     * @notice Reveal the choice (Rock / Paper / Scissor) by the player
     * @param move is the move made by the player
     * @param salt is the random string to generate unique hash
     */
    function revealChoice(Move move, uint salt) public {
        require(
            msg.sender == firstPlayer || msg.sender == secondPlayer,
            "player not registered"
        );
        require(
            firstPlayerHash != 0 && secondPlayerHash != 0,
            "someone did not submit hash"
        );
        require(move != Move.Empty, "have to choose Rock/Paper/Scissor");

        if (
            msg.sender == firstPlayer &&
            firstPlayerHash == sha256(abi.encodePacked(move, salt))
        ) {
            firstPlayerChoice = move;
        } else if (
            msg.sender == secondPlayer &&
            secondPlayerHash == sha256(abi.encodePacked(move, salt))
        ) {
            secondPlayerChoice = move;
        }

        if (
            firstPlayerChoice != Move.Empty && secondPlayerChoice != Move.Empty
        ) {
            gameEnded = true;
        }
    }

    /// @notice Declares the result and transfers winning amount
    /// after both the players have revealed their choices
    function getResult() public nonReentrant returns (Result res) {
        require(gameEnded == true, "someone did not reveal their choice");
        require(resultDeclared == false, "result already declared");

        resultDeclared = true;
        firstRegisterBlock = 0;

        if (firstPlayerChoice == secondPlayerChoice) {
            res = Result.Draw;
            firstPlayer.transfer(BETTING_AMOUNT);
            secondPlayer.transfer(BETTING_AMOUNT);
        } else if (
            (firstPlayerChoice == Move.Rock &&
                secondPlayerChoice == Move.Scissor) ||
            (firstPlayerChoice == Move.Paper &&
                secondPlayerChoice == Move.Rock) ||
            (firstPlayerChoice == Move.Scissor &&
                secondPlayerChoice == Move.Paper)
        ) {
            res = Result.FirstPlayer;
            firstPlayer.transfer((BETTING_AMOUNT * 2 * COMMISION) / 100);
        } else {
            res = Result.SecondPlayer;
            secondPlayer.transfer((BETTING_AMOUNT * 2 * COMMISION) / 100);
        }
    }

    /// @notice Expire the game and return the money if no activity
    /// after a certain block height
    function expireGame() public nonReentrant {
        if ((firstRegisterBlock + BLOCK_LIMIT) < block.number) {
            resultDeclared = true;
            firstRegisterBlock = 0;
            firstPlayer.transfer(BETTING_AMOUNT);
            secondPlayer.transfer(BETTING_AMOUNT);
        }
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract Factory {
    address public rps;

    // Returns the address of the newly deployed contract
    function deploy(bytes32 _salt) public payable returns (address) {
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        rps = address(new RPS{salt: _salt}());
        return rps;
    }
}
