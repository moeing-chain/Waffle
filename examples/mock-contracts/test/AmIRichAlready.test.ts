import {use, expect} from 'chai';
import {utils, Contract} from 'ethers';
import {deployMockContract, MockProvider, solidity, deployContract} from 'ethereum-waffle';
import {JsonRpcProvider} from '@ethersproject/providers'
import {Wallet} from '@ethersproject/wallet'

import IERC20 from '../build/IERC20.json';
import AmIRichAlready from '../build/AmIRichAlready.json';

use(solidity);

describe('Am I Rich Already', () => {
  let mockERC20: Contract;
  let contract: Contract;
  // const [wallet, otherWallet] = new MockProvider().getWallets();
  const provider = new JsonRpcProvider("http://127.0.0.1:8545")
  const wallet = new Wallet("0xe3d9be2e6430a9db8291ab1853f5ec2467822b33a1a08825a22fab1425d2bff9", provider)
  const walletTo = new Wallet("0x5a09e9d6be2cdc7de8f6beba300e52823493cd23357b1ca14a9c36764d600f5e", provider)

  // provider.on('debug', event => {
  //   if (event.action == 'request') {
  //     console.log(">>>", event.request)
  //   } else if (event.action == 'response') {
  //     console.log("<<<", "id=" + event.request.id, event.response)
  //   }
  // })

  beforeEach(async () => {
    mockERC20 = await deployMockContract(wallet, IERC20.abi);
    contract = await deployContract(wallet, AmIRichAlready, [mockERC20.address]);
  });

  it('returns false if the wallet has less then 1000000 coins', async () => {
    await mockERC20.mock.balanceOf.returns(utils.parseEther('999999'));
    expect(await contract.check()).to.be.equal(false);
  });

  it('returns true if the wallet has at least 1000000 coins', async () => {
    await mockERC20.mock.balanceOf.returns(utils.parseEther('1000001'));
    expect(await contract.check()).to.equal(true);
  });

  it('reverts if the ERC20 reverts', async () => {
    await mockERC20.mock.balanceOf.reverts();
    await expect(contract.check()).to.be.revertedWith('Mock revert');
  });

  it('returns 1000001 coins for my address and 0 otherwise', async () => {
    await mockERC20.mock.balanceOf.returns('0');
    await mockERC20.mock.balanceOf.withArgs(wallet.address).returns(utils.parseEther('1000001'));

    expect(await contract.check()).to.equal(true);
    expect(await contract.connect(otherWallet.address).check()).to.equal(false);
  });
});
