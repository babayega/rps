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
    it("Second player should win", async function () {
      const fpMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Rock, "123"])
      const spMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Paper, "12"])
      await rps.connect(fp).commitChoice(fpMove);
      await rps.connect(sp).commitChoice(spMove);


      await rps.connect(fp).revealChoice(Move.Rock, 123);
      expect(await rps.firstPlayerChoice()).to.be.eq(1);

      await rps.connect(sp).revealChoice(Move.Paper, 12);
      expect(await rps.secondPlayerChoice()).to.be.eq(2);

      expect(await rps.getResult()).to.be.eq(2);;
    });
    it("First player should win", async function () {
      const fpMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Scissor, "123"])
      const spMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Paper, "12"])
      await rps.connect(fp).commitChoice(fpMove);
      await rps.connect(sp).commitChoice(spMove);


      await rps.connect(fp).revealChoice(Move.Scissor, 123);
      expect(await rps.firstPlayerChoice()).to.be.eq(3);

      await rps.connect(sp).revealChoice(Move.Paper, 12);
      expect(await rps.secondPlayerChoice()).to.be.eq(2);

      expect(await rps.getResult()).to.be.eq(1);
    });
    it("Draw", async function () {
      const fpMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Paper, "123"])
      const spMove = ethers.utils.soliditySha256(["uint8", "uint"], [Move.Paper, "12"])
      await rps.connect(fp).commitChoice(fpMove);
      await rps.connect(sp).commitChoice(spMove);


      await rps.connect(fp).revealChoice(Move.Paper, 123);
      expect(await rps.firstPlayerChoice()).to.be.eq(2);

      await rps.connect(sp).revealChoice(Move.Paper, 12);
      expect(await rps.secondPlayerChoice()).to.be.eq(2);

      expect(await rps.getResult()).to.be.eq(3);
    });
  });
});
