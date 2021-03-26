import {expect, use} from 'chai';
import {Contract, Signer} from 'ethers';
import {JsonRpcProvider} from '@ethersproject/providers'
import {Wallet} from '@ethersproject/wallet'
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import BasicToken from '../build/BasicToken.json';

use(solidity);

describe('BasicToken', () => {
  // const [wallet, walletTo] = new MockProvider().getWallets();
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

  let token: Contract;

  beforeEach(async () => {
    token = await deployContract(wallet, BasicToken, [1000]);
  });

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(1000);
  });

  it('Transfer adds amount to destination account', async () => {
    const tx1 = await token.transfer(walletTo.address, 7); await tx1.wait()
    expect(await token.balanceOf(walletTo.address)).to.equal(7);
  });

  it('Transfer emits event', async () => {
    await expect(token.transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7);
  });

  it('Can not transfer above the amount', async () => {
    await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
  });

  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo);
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
      .to.be.reverted;
  });

  it('Calls totalSupply on BasicToken contract', async () => {
    await token.totalSupply();
    expect('totalSupply').to.be.calledOnContract(token);
  });

  it('Calls balanceOf with sender address on BasicToken contract', async () => {
    await token.balanceOf(wallet.address);
    expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
  });
});
