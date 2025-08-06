import { assert, expect } from 'chai';
import { describe } from 'mocha';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../helpers';
import { ContriFlow, MockV3Aggregator } from '../typechain-types';

const AMOUNT_TO_ADD = ethers.parseEther('1.0');
const PRIMARY_GITHUB_ID = 1;
const SECONDARY_GITHUB_ID = 2;

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('ContriFlow', () => {
      let contriflow: ContriFlow,
        MockV3Aggregator: MockV3Aggregator,
        deployer: string;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;

        await deployments.fixture(['all']);
        const deployerSigner = await ethers.getSigner(deployer);

        contriflow = await ethers.getContractAt(
          'ContriFlow',
          (await deployments.get('ContriFlow')).address,
          deployerSigner
        );
        MockV3Aggregator = await ethers.getContractAt(
          'MockV3Aggregator',
          (await deployments.get('MockV3Aggregator')).address,
          deployerSigner
        );
      });

      describe('constructor', async function () {
        it('It sets aggregator addresses correctly', async function () {
          const priceFeed = await contriflow.s_priceFeed();
          assert.equal(priceFeed, await MockV3Aggregator.getAddress());
        });
      });

      describe('addAmount', async () => {
        it("Should add amount to owner's deposit", async () => {
          const initialBalance = (await contriflow.getOwnerDetails(deployer))
            .amount;

          await contriflow.addAmount(PRIMARY_GITHUB_ID, {
            value: AMOUNT_TO_ADD,
          });

          const newBalance = (await contriflow.getOwnerDetails(deployer))
            .amount;
          expect(newBalance).to.equal(initialBalance + AMOUNT_TO_ADD);
        });

        it('should github id mismatch', async () => {
          await contriflow.addAmount(PRIMARY_GITHUB_ID, {
            value: AMOUNT_TO_ADD,
          });
          await expect(
            contriflow.addAmount(SECONDARY_GITHUB_ID, {
              value: AMOUNT_TO_ADD,
            })
          ).to.be.revertedWithCustomError(contriflow, 'GithubIdMismatch');
        });
      });

      describe('removeAmount', () => {
        beforeEach(async () => {
          await contriflow.addAmount(PRIMARY_GITHUB_ID, {
            value: AMOUNT_TO_ADD,
          });
        });

        it('should remove the correct amount from deposit', async () => {
          const initial = (await contriflow.getOwnerDetails(deployer)).amount;
          await contriflow.removeAmount(ethers.parseEther('0.5'));

          const finalAmount = (await contriflow.getOwnerDetails(deployer))
            .amount;
          expect(finalAmount).to.equal(initial - ethers.parseEther('0.5'));
        });

        it('should revert if removing more than balance', async () => {
          await expect(
            contriflow.removeAmount(ethers.parseEther('2'))
          ).to.be.revertedWithCustomError(contriflow, 'InsufficientBalance');
        });
      });

      describe('storeVoucher', () => {
        const repoId = 123;
        const prNumber = 42;
        const contributorGithubId = 777;
        const dollarAmount8dec = BigInt(50e8);

        let voucherHash: string;

        beforeEach(async () => {
          await contriflow.addAmount(PRIMARY_GITHUB_ID, {
            value: ethers.parseEther('10'),
          });

          voucherHash = ethers.keccak256(
            ethers.toUtf8Bytes(
              ethers.solidityPacked(
                [
                  'string',
                  'address',
                  'uint256',
                  'uint256',
                  'uint256',
                  'uint256',
                  'uint256',
                ],
                [
                  'secret',
                  deployer,
                  PRIMARY_GITHUB_ID,
                  repoId,
                  prNumber,
                  contributorGithubId,
                  dollarAmount8dec,
                ]
              )
            )
          );
        });

        it('should store voucher correctly by bot', async () => {
          await contriflow.storeVoucher(
            deployer,
            PRIMARY_GITHUB_ID,
            repoId,
            contributorGithubId,
            prNumber,
            dollarAmount8dec,
            voucherHash
          );

          const stored = await contriflow.getVoucherDetails(
            PRIMARY_GITHUB_ID,
            repoId,
            prNumber
          );
          expect(stored.hash).to.equal(voucherHash);
          expect(stored.claimed).to.equal(false);
        });

        it('should revert if voucher already exists', async () => {
          await contriflow.storeVoucher(
            deployer,
            PRIMARY_GITHUB_ID,
            repoId,
            contributorGithubId,
            prNumber,
            dollarAmount8dec,
            voucherHash
          );

          await expect(
            contriflow.storeVoucher(
              deployer,
              PRIMARY_GITHUB_ID,
              repoId,
              contributorGithubId,
              prNumber,
              dollarAmount8dec,
              voucherHash
            )
          ).to.be.revertedWithCustomError(contriflow, 'VoucherExists');
        });

        it('should revert if ETH amount is 0 (Chainlink price too high)', async () => {
          const verySmallUsd = BigInt(1); // 0.00000001 USD
          await expect(
            contriflow.storeVoucher(
              deployer,
              PRIMARY_GITHUB_ID,
              repoId,
              contributorGithubId,
              prNumber,
              verySmallUsd,
              ethers.keccak256(ethers.toUtf8Bytes('whatever'))
            )
          ).to.be.revertedWith('Invalid ETH amount');
        });
      });

      describe('claimReward', () => {
        const repoId = 321;
        const prNumber = 101;
        const contributorGithubId = 9000;
        const dollarAmount8dec = BigInt(100e8);
        const secret = 'super_secret';

        let voucherHash: string;
        let contributor: string;
        let contributorSigner: any;

        beforeEach(async () => {
          const signers = await ethers.getSigners();
          contributorSigner = signers[1];
          contributor = await contributorSigner.getAddress();

          await contriflow.addAmount(PRIMARY_GITHUB_ID, {
            value: ethers.parseEther('10'),
          });

          voucherHash = ethers.keccak256(
            ethers.solidityPacked(
              [
                'string',
                'address',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
              ],
              [
                secret,
                deployer,
                PRIMARY_GITHUB_ID,
                repoId,
                prNumber,
                contributorGithubId,
                dollarAmount8dec,
              ]
            )
          );

          await contriflow.storeVoucher(
            deployer,
            PRIMARY_GITHUB_ID,
            repoId,
            contributorGithubId,
            prNumber,
            dollarAmount8dec,
            voucherHash
          );
        });

        it('should allow contributor to claim reward', async () => {
          const contractBalanceBefore = await ethers.provider.getBalance(
            contriflow.target
          );

          await contriflow
            .connect(contributorSigner)
            .claimReward(
              secret,
              deployer,
              PRIMARY_GITHUB_ID,
              repoId,
              prNumber,
              contributorGithubId,
              dollarAmount8dec
            );

          const stored = await contriflow.getVoucherDetails(
            PRIMARY_GITHUB_ID,
            repoId,
            prNumber
          );
          expect(stored.claimed).to.equal(true);

          const contractBalanceAfter = await ethers.provider.getBalance(
            contriflow.target
          );
          expect(contractBalanceAfter).to.be.lt(contractBalanceBefore);
        });

        it('should revert if already claimed', async () => {
          await contriflow
            .connect(contributorSigner)
            .claimReward(
              secret,
              deployer,
              PRIMARY_GITHUB_ID,
              repoId,
              prNumber,
              contributorGithubId,
              dollarAmount8dec
            );

          await expect(
            contriflow
              .connect(contributorSigner)
              .claimReward(
                secret,
                deployer,
                PRIMARY_GITHUB_ID,
                repoId,
                prNumber,
                contributorGithubId,
                dollarAmount8dec
              )
          ).to.be.revertedWithCustomError(contriflow, 'AlreadyClaimed');
        });

        it('should revert if wrong secret provided', async () => {
          await expect(
            contriflow
              .connect(contributorSigner)
              .claimReward(
                'wrong_secret',
                deployer,
                PRIMARY_GITHUB_ID,
                repoId,
                prNumber,
                contributorGithubId,
                dollarAmount8dec
              )
          ).to.be.revertedWithCustomError(contriflow, 'InvalidVoucher');
        });

        it('should revert if balance is insufficient', async () => {
          await contriflow.removeAmount(ethers.parseEther('10'));

          await expect(
            contriflow
              .connect(contributorSigner)
              .claimReward(
                secret,
                deployer,
                PRIMARY_GITHUB_ID,
                repoId,
                prNumber,
                contributorGithubId,
                dollarAmount8dec
              )
          ).to.be.revertedWithCustomError(contriflow, 'InsufficientBalance');
        });
      });
    });
