import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

// Solidity Smart Contract Examples
const erc20Token = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MyToken
 * @dev ERC20 Token with minting, burning, pausability, and role-based access
 */
contract MyToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Events
    event TokensMinted(address indexed to, uint256 amount, address indexed minter);
    event MaxSupplyUpdated(uint256 oldMaxSupply, uint256 newMaxSupply);

    // State variables
    uint256 public maxSupply;
    mapping(address => bool) private _blacklist;

    // Errors
    error ExceedsMaxSupply(uint256 requested, uint256 available);
    error AddressBlacklisted(address account);
    error InvalidMaxSupply();

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _maxSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        if (_maxSupply < initialSupply) revert InvalidMaxSupply();
        
        maxSupply = _maxSupply;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Mint new tokens with supply cap check
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        if (totalSupply() + amount > maxSupply) {
            revert ExceedsMaxSupply(amount, maxSupply - totalSupply());
        }
        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    /**
     * @dev Add address to blacklist
     */
    function blacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _blacklist[account] = true;
    }

    /**
     * @dev Remove address from blacklist
     */
    function unblacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _blacklist[account] = false;
    }

    /**
     * @dev Check if address is blacklisted
     */
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    // Override required by Solidity
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        if (_blacklist[from]) revert AddressBlacklisted(from);
        if (_blacklist[to]) revert AddressBlacklisted(to);
        super._update(from, to, value);
    }
}`;

const nftContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTCollection
 * @dev ERC721 NFT with whitelist, phases, and reveal mechanism
 */
contract NFTCollection is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC721Pausable, 
    Ownable,
    ReentrancyGuard 
{
    using Strings for uint256;

    // Sale phases
    enum Phase { Inactive, Whitelist, Public }
    Phase public currentPhase;

    // Collection parameters
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant WHITELIST_PRICE = 0.05 ether;
    uint256 public constant PUBLIC_PRICE = 0.08 ether;
    uint256 public constant MAX_PER_WALLET = 5;

    // State
    uint256 private _nextTokenId;
    bytes32 public merkleRoot;
    string private _baseTokenURI;
    string private _hiddenMetadataURI;
    bool public revealed;

    // Tracking
    mapping(address => uint256) public mintedPerWallet;

    // Events
    event PhaseChanged(Phase indexed newPhase);
    event Revealed(string baseURI);
    event Withdrawn(address indexed to, uint256 amount);

    // Errors
    error InvalidPhase();
    error ExceedsMaxSupply();
    error ExceedsWalletLimit();
    error InsufficientPayment();
    error NotWhitelisted();
    error WithdrawFailed();

    constructor(
        string memory name,
        string memory symbol,
        string memory hiddenURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _hiddenMetadataURI = hiddenURI;
        currentPhase = Phase.Inactive;
    }

    // ============ Minting Functions ============

    /**
     * @dev Whitelist mint with Merkle proof verification
     */
    function whitelistMint(
        uint256 quantity,
        bytes32[] calldata proof
    ) external payable nonReentrant {
        if (currentPhase != Phase.Whitelist) revert InvalidPhase();
        if (!_verifyWhitelist(msg.sender, proof)) revert NotWhitelisted();
        
        _mintInternal(msg.sender, quantity, WHITELIST_PRICE);
    }

    /**
     * @dev Public mint
     */
    function publicMint(uint256 quantity) external payable nonReentrant {
        if (currentPhase != Phase.Public) revert InvalidPhase();
        
        _mintInternal(msg.sender, quantity, PUBLIC_PRICE);
    }

    /**
     * @dev Internal mint logic
     */
    function _mintInternal(
        address to,
        uint256 quantity,
        uint256 price
    ) private {
        if (_nextTokenId + quantity > MAX_SUPPLY) revert ExceedsMaxSupply();
        if (mintedPerWallet[to] + quantity > MAX_PER_WALLET) revert ExceedsWalletLimit();
        if (msg.value < price * quantity) revert InsufficientPayment();

        mintedPerWallet[to] += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
    }

    /**
     * @dev Owner mint for team/giveaways
     */
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (_nextTokenId + quantity > MAX_SUPPLY) revert ExceedsMaxSupply();

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
    }

    // ============ Admin Functions ============

    function setPhase(Phase phase) external onlyOwner {
        currentPhase = phase;
        emit PhaseChanged(phase);
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
    }

    function reveal(string calldata baseURI) external onlyOwner {
        revealed = true;
        _baseTokenURI = baseURI;
        emit Revealed(baseURI);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawFailed();
        emit Withdrawn(owner(), balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        _requireOwned(tokenId);

        if (!revealed) {
            return _hiddenMetadataURI;
        }

        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _nextTokenId;
    }

    // ============ Internal Functions ============

    function _verifyWhitelist(
        address account,
        bytes32[] calldata proof
    ) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    // Required overrides
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`;

const defiStaking = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StakingPool
 * @dev Stake tokens to earn rewards with time-based multipliers
 */
contract StakingPool is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Tokens
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    // Staking parameters
    uint256 public rewardRate; // Rewards per second
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MIN_STAKE_DURATION = 7 days;
    uint256 public constant MAX_STAKE_DURATION = 365 days;

    // Reward tracking
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;

    // Lock tiers with bonus multipliers
    struct LockTier {
        uint256 duration;
        uint256 multiplier; // 100 = 1x, 150 = 1.5x, 200 = 2x
    }
    LockTier[] public lockTiers;

    // User stake info
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockDuration;
        uint256 rewardDebt;
        uint256 pendingRewards;
    }
    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public userRewardPerTokenPaid;

    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockDuration);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    // Errors
    error InsufficientBalance();
    error StakeLocked();
    error InvalidLockDuration();
    error NoStake();
    error ZeroAmount();

    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;

        // Initialize lock tiers
        lockTiers.push(LockTier(7 days, 100));    // 1x
        lockTiers.push(LockTier(30 days, 125));   // 1.25x
        lockTiers.push(LockTier(90 days, 150));   // 1.5x
        lockTiers.push(LockTier(180 days, 175));  // 1.75x
        lockTiers.push(LockTier(365 days, 200));  // 2x
    }

    // ============ Modifiers ============

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            stakes[account].pendingRewards = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    // ============ Core Functions ============

    /**
     * @dev Stake tokens with lock duration
     */
    function stake(
        uint256 amount,
        uint256 lockDuration
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (!_isValidLockDuration(lockDuration)) revert InvalidLockDuration();

        StakeInfo storage userStake = stakes[msg.sender];
        
        // If already staking, claim pending rewards first
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        userStake.amount += amount;
        userStake.startTime = block.timestamp;
        userStake.lockDuration = lockDuration;
        
        totalStaked += amount;

        emit Staked(msg.sender, amount, lockDuration);
    }

    /**
     * @dev Withdraw staked tokens after lock period
     */
    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        StakeInfo storage userStake = stakes[msg.sender];
        
        if (amount == 0) revert ZeroAmount();
        if (userStake.amount < amount) revert InsufficientBalance();
        if (block.timestamp < userStake.startTime + userStake.lockDuration) {
            revert StakeLocked();
        }

        // Claim pending rewards
        _claimRewards(msg.sender);

        userStake.amount -= amount;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal claim logic
     */
    function _claimRewards(address account) private {
        uint256 reward = stakes[account].pendingRewards;
        if (reward > 0) {
            stakes[account].pendingRewards = 0;
            rewardToken.safeTransfer(account, reward);
            emit RewardClaimed(account, reward);
        }
    }

    // ============ View Functions ============

    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + (
            (block.timestamp - lastUpdateTime) * rewardRate * PRECISION / totalStaked
        );
    }

    /**
     * @dev Calculate earned rewards for account
     */
    function earned(address account) public view returns (uint256) {
        StakeInfo storage userStake = stakes[account];
        uint256 multiplier = _getMultiplier(userStake.lockDuration);
        
        return (
            userStake.amount * 
            (rewardPerToken() - userRewardPerTokenPaid[account]) *
            multiplier / (100 * PRECISION)
        ) + userStake.pendingRewards;
    }

    /**
     * @dev Get remaining lock time
     */
    function remainingLockTime(address account) public view returns (uint256) {
        StakeInfo storage userStake = stakes[account];
        uint256 unlockTime = userStake.startTime + userStake.lockDuration;
        
        if (block.timestamp >= unlockTime) {
            return 0;
        }
        return unlockTime - block.timestamp;
    }

    /**
     * @dev Get APY for lock duration (approximate)
     */
    function getAPY(uint256 lockDuration) external view returns (uint256) {
        uint256 multiplier = _getMultiplier(lockDuration);
        // Simplified APY calculation
        return rewardRate * 365 days * multiplier / 100;
    }

    // ============ Internal Functions ============

    function _getMultiplier(uint256 duration) private view returns (uint256) {
        for (uint256 i = lockTiers.length; i > 0; i--) {
            if (duration >= lockTiers[i - 1].duration) {
                return lockTiers[i - 1].multiplier;
            }
        }
        return 100;
    }

    function _isValidLockDuration(uint256 duration) private view returns (bool) {
        for (uint256 i = 0; i < lockTiers.length; i++) {
            if (duration == lockTiers[i].duration) {
                return true;
            }
        }
        return false;
    }

    // ============ Admin Functions ============

    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)) {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdrawRewards() external onlyOwner {
        uint256 balance = rewardToken.balanceOf(address(this));
        rewardToken.safeTransfer(owner(), balance);
    }
}`;

const hardhatConfig = `// Hardhat Configuration & Development Setup
// ==========================================

// ============ hardhat.config.ts ============
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL || "",
        enabled: process.env.FORK_ENABLED === "true",
      },
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};

export default config;

// ============ .env.example ============
PRIVATE_KEY=your_wallet_private_key
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true
FORK_ENABLED=false

// ============ package.json scripts ============
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "test:coverage": "hardhat coverage",
    "test:gas": "REPORT_GAS=true hardhat test",
    "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
    "deploy:mainnet": "hardhat run scripts/deploy.ts --network mainnet",
    "verify": "hardhat verify --network sepolia",
    "clean": "hardhat clean",
    "node": "hardhat node",
    "console": "hardhat console"
  }
}

// ============ Deploy Script (scripts/deploy.ts) ============
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy Token
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(
    "MyToken",
    "MTK",
    ethers.parseEther("1000000"), // Initial supply
    ethers.parseEther("10000000") // Max supply
  );
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  // Deploy NFT Collection
  const NFT = await ethers.getContractFactory("NFTCollection");
  const nft = await NFT.deploy(
    "MyNFT",
    "MNFT",
    "ipfs://hidden-metadata-uri/"
  );
  await nft.waitForDeployment();
  console.log("NFT deployed to:", await nft.getAddress());

  // Verify on Etherscan (after some block confirmations)
  console.log("Waiting for block confirmations...");
  await token.deploymentTransaction()?.wait(6);
  
  console.log("Verifying contracts...");
  // npx hardhat verify --network sepolia <address> <constructor args>
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// ============ Test Example (test/Token.test.ts) ============
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MyToken } from "../typechain-types";

describe("MyToken", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy(
      "MyToken",
      "MTK",
      ethers.parseEther("1000"),
      ethers.parseEther("10000")
    );

    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address))
        .to.be.true;
    });

    it("Should assign initial supply to owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.balanceOf(owner.address))
        .to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Minting", function () {
    it("Should mint tokens when called by minter", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      await token.mint(addr1.address, ethers.parseEther("100"));
      expect(await token.balanceOf(addr1.address))
        .to.equal(ethers.parseEther("100"));
    });

    it("Should revert when exceeding max supply", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      await expect(token.mint(addr1.address, ethers.parseEther("10000")))
        .to.be.revertedWithCustomError(token, "ExceedsMaxSupply");
    });
  });

  describe("Blacklist", function () {
    it("Should prevent blacklisted address from receiving", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      await token.blacklist(addr1.address);
      await expect(token.transfer(addr1.address, ethers.parseEther("10")))
        .to.be.revertedWithCustomError(token, "AddressBlacklisted");
    });
  });
});

// ============ Useful Commands ============
// 
// # Compile contracts
// npx hardhat compile
//
// # Run tests
// npx hardhat test
// npx hardhat test --grep "minting"
//
// # Run with gas report
// REPORT_GAS=true npx hardhat test
//
// # Coverage report
// npx hardhat coverage
//
// # Start local node
// npx hardhat node
//
// # Deploy to local
// npx hardhat run scripts/deploy.ts --network localhost
//
// # Deploy to testnet
// npx hardhat run scripts/deploy.ts --network sepolia
//
// # Verify contract
// npx hardhat verify --network sepolia 0x... "MyToken" "MTK" "1000000" "10000000"
//
// # Console (interact with contracts)
// npx hardhat console --network sepolia
//
// # Flatten for manual verification
// npx hardhat flatten contracts/MyToken.sol > Flattened.sol
//
// # Check contract size
// npx hardhat size-contracts`;

const web3Integration = `// Web3 Integration Examples
// =========================

// ============ React + wagmi + viem ============
import { createConfig, http, useAccount, useConnect, useDisconnect } from 'wagmi';
import { mainnet, sepolia, polygon } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useReadContract, useWriteContract } from 'wagmi';

// Config
const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  connectors: [
    injected(),
    walletConnect({ projectId: 'YOUR_PROJECT_ID' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient();

// Providers wrapper
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ============ Connect Wallet Component ============
function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          Connect with {connector.name}
        </button>
      ))}
    </div>
  );
}

// ============ Read Contract ============
const tokenAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

function TokenBalance({ tokenAddress }: { tokenAddress: \`0x\${string}\` }) {
  const { address } = useAccount();
  
  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });

  if (isLoading) return <p>Loading...</p>;
  
  return <p>Balance: {balance?.toString()}</p>;
}

// ============ Write Contract ============
const stakingAbi = [
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'lockDuration', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

function StakeTokens({ stakingAddress }: { stakingAddress: \`0x\${string}\` }) {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const handleStake = async () => {
    writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: 'stake',
      args: [parseEther('100'), BigInt(30 * 24 * 60 * 60)], // 100 tokens, 30 days
    });
  };

  return (
    <div>
      <button onClick={handleStake} disabled={isPending}>
        {isPending ? 'Staking...' : 'Stake 100 Tokens'}
      </button>
      {isSuccess && <p>Staked successfully!</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}

// ============ ethers.js v6 (Alternative) ============
import { ethers, formatEther, parseEther } from 'ethers';

async function connectWithEthers() {
  // Browser wallet
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  console.log('Connected:', address);
  return { provider, signer, address };
}

async function readContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  const tokenContract = new ethers.Contract(
    '0x...tokenAddress',
    ['function balanceOf(address) view returns (uint256)'],
    provider
  );

  const balance = await tokenContract.balanceOf('0x...userAddress');
  console.log('Balance:', formatEther(balance));
}

async function writeContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const stakingContract = new ethers.Contract(
    '0x...stakingAddress',
    ['function stake(uint256 amount, uint256 lockDuration)'],
    signer
  );

  const tx = await stakingContract.stake(
    parseEther('100'),
    30 * 24 * 60 * 60 // 30 days in seconds
  );
  
  console.log('TX Hash:', tx.hash);
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
}

// ============ Event Listening ============
async function listenToEvents() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  const contract = new ethers.Contract(
    '0x...contractAddress',
    ['event Transfer(address indexed from, address indexed to, uint256 value)'],
    provider
  );

  // Listen for Transfer events
  contract.on('Transfer', (from, to, value, event) => {
    console.log(\`Transfer: \${from} -> \${to}: \${formatEther(value)}\`);
  });

  // Query past events
  const filter = contract.filters.Transfer(null, '0x...myAddress');
  const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks
  console.log('Past transfers:', events.length);
}`;

const categories = [
  {
    id: "solidity-erc20",
    title: "ERC20 Token Contract",
    badge: "Solidity",
    examples: [
      { title: "Token with Roles, Pausable & Permit", code: erc20Token, filename: "MyToken.sol" },
    ]
  },
  {
    id: "solidity-nft",
    title: "NFT Collection (ERC721)",
    badge: "Solidity",
    examples: [
      { title: "NFT with Whitelist, Phases & Reveal", code: nftContract, filename: "NFTCollection.sol" },
    ]
  },
  {
    id: "solidity-defi",
    title: "DeFi Staking Contract",
    badge: "DeFi",
    examples: [
      { title: "Staking Pool with Lock Tiers", code: defiStaking, filename: "StakingPool.sol" },
    ]
  },
  {
    id: "hardhat-setup",
    title: "Hardhat Development Setup",
    badge: "Tools",
    examples: [
      { title: "Config, Deploy & Test", code: hardhatConfig, filename: "hardhat.config.ts" },
    ]
  },
  {
    id: "web3-integration",
    title: "Web3 Frontend Integration",
    badge: "React",
    examples: [
      { title: "wagmi + viem + ethers.js", code: web3Integration, filename: "web3-integration.tsx" },
    ]
  },
];

const SmartContractsSection = () => {
  return (
    <section id="smart-contracts" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Smart Contracts & Web3
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Blockchain development with Solidity, Hardhat, and Web3 integration. ERC20, ERC721, DeFi patterns, and frontend connectivity.
          </p>
        </div>

        <div className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {categories.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border-border">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-[hsl(var(--terminal-purple))]/10 text-[hsl(var(--terminal-purple))] border-[hsl(var(--terminal-purple))]/30">
                      {category.badge}
                    </Badge>
                    <span className="font-mono text-sm">{category.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {category.examples.map((example, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">{example.title}</h4>
                      <CodeBlock 
                        code={example.code} 
                        language={example.filename.endsWith('.sol') ? 'solidity' : 'typescript'} 
                        filename={example.filename}
                        collapsible
                        defaultExpanded={idx === 0}
                      />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default SmartContractsSection;
