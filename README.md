<!-- Setup and deploy hardhat project -->

(1) Creating a new Hardhat project
```mkdir hardhat-tutorial
   cd hardhat-tutorial```

->Then initialize an npm project as shown below. You'll be prompted to answer some questions.
```npm init```

->Now we can install Hardhat:
```npm install --save-dev hardhat```

->In the same directory where you installed Hardhat run:
```npx hardhat init```

->Select Create an empty hardhat.config.js with your keyboard and hit enter.


->@nomicfoundation/hardhat-toolbox
, which has everything you need for developing smart contracts.

To install it, run this in your project directory:
```npm install --save-dev @nomicfoundation/hardhat-toolbox```

->Add the below line to your hardhat.config.js so that it looks like this:
```require("@nomicfoundation/hardhat-toolbox");```


(2)Writing and compiling smart contracts

->Start by creating a new directory called contracts and create a file inside the directory called Token.sol and Paste the smart contract code

-->>Compiling contracts
```npx hardhat compile```

(3)Testing contracts
->In our tests we're going to use ethers.js to interact with the Ethereum contract we built in the previous section, and we'll use Mocha as our test runner.

->Create a new directory called test inside our project root directory and create a new file in there called Polpick.js.

const { expect } = require("chai");

~describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("Token");

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});~

--> In your terminal run npx hardhat test

(4) Debugging with Hardhat Network
```import "hardhat/console.sol";```

(5) Deploying to a live network
-->Let's create a new directory ignition inside the project root's directory, then, create a directory named modules inside of the ignition directory. Paste the following into a Token.js file in that directory:

~const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
  const token = m.contract("Token");

  return { token };
});

module.exports = TokenModule;~

-->To deploy to a remote network such as mainnet or any testnet, you need to add a network entry to your hardhat.config.js file. We’ll use base mainnet for this example, but you can add any network. For key storage, utilize the configuration variables.

~require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()


module.exports = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.POLYGON_PRIVATE_KEY],
    },
  },
};
~

-->Finally, run:

```npx hardhat ignition deploy ./ignition/modules/Token.js --network sepolia```


