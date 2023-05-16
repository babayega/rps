import { HardhatRuntimeEnvironment } from "hardhat/types";

const main = async ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  console.log('here')
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(`Deploying RPS Contract on ${network.name}`);

  const rps = await deploy("RPS", {
    contract: "RPS",
    from: deployer,
    deterministicDeployment: true
  });

  console.log(`RPS @ ${rps.address}`);
};
main.tags = ["RPS"];

export default main;
