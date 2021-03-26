import {expect, use} from 'chai';
import {Contract, utils} from 'ethers';
import {deployContract, deployMockContract, MockProvider, solidity} from 'ethereum-waffle';
import {JsonRpcProvider} from '@ethersproject/providers'
import {Wallet} from '@ethersproject/wallet'

import IERC20 from '../build/IERC20.json';
import AmIRichAlready from '../build/AmIRichAlready.json';

use(solidity);

describe('Am I Rich Already', () => {
  let mockERC20: Contract;
  let contract: Contract;
  let wallet: Wallet;

  beforeEach(async () => {
    // [wallet] = new MockProvider().getWallets();
    const provider = new JsonRpcProvider("http://127.0.0.1:8545")
    const wallet = new Wallet("0xe3d9be2e6430a9db8291ab1853f5ec2467822b33a1a08825a22fab1425d2bff9", provider)
  provider.on('debug', event => {
    if (event.action == 'request') {
      console.log(">>>", event.request)
    } else if (event.action == 'response') {
      console.log("<<<", "id=" + event.request.id, event.response)
    }
  })

    console.log("aaaa")
    mockERC20 = await deployMockContract(wallet, IERC20.abi);
    console.log("bbbbb")
    contract = await deployContract(wallet, AmIRichAlready, [mockERC20.address]);
    console.log("cccc")
  });

  it('checks if contract called balanceOf with certain wallet on the ERC20 token', async () => {
    await mockERC20.mock.balanceOf
      .withArgs(wallet.address)
      .returns(utils.parseEther('999999'));
    await contract.check();
    expect('balanceOf').to.be.calledOnContractWith(mockERC20, [wallet.address]);
  });

  it('returns false if the wallet has less than 1000000 coins', async () => {
    await mockERC20.mock.balanceOf
      .withArgs(wallet.address)
      .returns(utils.parseEther('999999'));
    expect(await contract.check()).to.be.equal(false);
  });

  it('returns true if the wallet has at least 1000000 coins', async () => {
    await mockERC20.mock.balanceOf
      .withArgs(wallet.address)
      .returns(utils.parseEther('1000000'));
    expect(await contract.check()).to.be.equal(false);
  });
});
