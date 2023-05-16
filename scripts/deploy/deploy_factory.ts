import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from 'hardhat'

const main = async ({
    network,
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
    console.log('here')
    const { deploy, execute } = deployments;
    const { deployer } = await getNamedAccounts();
    console.log(`Deploying RPS Contract on ${network.name}`);

    const rps = await deploy("Factory", {
        contract: "Factory",
        from: deployer,
    });

    console.log(`Factory @ ${rps.address}`);

    const rec = await execute('Factory', { from: deployer }, 'deploy', ...[ethers.utils.formatBytes32String("1234")]);
    console.log(rec);
};
main.tags = ["RPS_Factory"];

export default main;
