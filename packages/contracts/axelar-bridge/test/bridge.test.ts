import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Bridge Core', () => {
  it('WrappedInterchainToken: onlyGateway mint/burn', async () => {
    const [owner, gateway, user] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('WrappedInterchainToken');
    const impl = await factory.deploy();
    await impl.waitForDeployment();
    const c = await ethers.getContractAt(
      'WrappedInterchainToken',
      await impl.getAddress()
    );
    await (c as any).initialize(
      'Wrapped',
      'WTK',
      owner.address,
      gateway.address
    );

    await expect(
      (c as any).mintByGateway(user.address, 100)
    ).to.be.revertedWithCustomError(c, 'OnlyGateway');
    await expect((c.connect(gateway) as any).mintByGateway(user.address, 100))
      .to.emit(c, 'TokensMinted')
      .withArgs(user.address, 100);

    expect(await (c as any).totalSupply()).to.equal(100);
    await expect((c.connect(gateway) as any).burnByGateway(50))
      .to.emit(c, 'TokensBurned')
      .withArgs(gateway.address, 50);
    expect(await (c as any).totalSupply()).to.equal(50);
  });

  it('CanonicalToken: lock/unlock by gateway', async () => {
    const [owner, gateway, user] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('CanonicalToken');
    const impl = await factory.deploy();
    await impl.waitForDeployment();
    const c = await ethers.getContractAt(
      'CanonicalToken',
      await impl.getAddress()
    );
    await (c as any).initialize(
      'Canonical',
      'CTK',
      owner.address,
      gateway.address
    );
    await (c as any).mint(gateway.address, 1000);

    await expect((c as any).bridgeLock(200)).to.be.revertedWithCustomError(
      c,
      'OnlyGateway'
    );
    await expect((c.connect(gateway) as any).bridgeLock(200)).to.emit(
      c,
      'TokensLocked'
    );
    expect(await (c as any).balanceOf(await c.getAddress())).to.equal(200);

    await expect(
      (c.connect(gateway) as any).bridgeUnlock(user.address, 100)
    ).to.emit(c, 'TokensUnlocked');
    expect(await (c as any).balanceOf(user.address)).to.equal(100);
  });
});
