import { expect } from "chai";
import { ethers } from "hardhat";
import { RPS } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

enum Move {
  Empty = 0,
  Rock = 1,
  Paper = 2,
  Scissor = 3,
}

describe("RPS", function () {
  let rps: RPS
  let fp: SignerWithAddress,
    sp: SignerWithAddress

  async function deployRPS() {
    // Contracts are deployed using the first signer/account by default
    [fp, sp] = await ethers.getSigners();

    const RPS = await ethers.getContractFactory("RPS");
    rps = await RPS.deploy();

    await rps.connect(fp).register();
    await rps.connect(sp).register();
  }

  describe("Test Cases", function () {
    beforeEach(async function () {
      await deployRPS();
    })
    it("Should deploy the contract and register both players", async function () {
      // console.log(rps.connect(fp).revealChoice())
      // ethers.utils.solidityPack(["int16", "uint48"], [-1, 12])
      // ethers.utils.
      const fpMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Rock, "123"])
      const spMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Paper, "12"])
      await rps.connect(fp).commitChoice(fpMove);
      await rps.connect(sp).commitChoice(spMove);


      await rps.connect(fp).revealChoice(Move.Rock, 123);
      console.log(await rps.firstPlayerChoice());

      await rps.connect(sp).revealChoice(Move.Paper, 12);
      console.log(await rps.secondPlayerChoice());

      console.log(await rps.getResult());
    });
  });
});
