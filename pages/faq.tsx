import React from 'react'
import type { NextPage } from 'next'
import PageLayout from '../components/PageLayout'

const FAQ: NextPage = () => {
  return (
    <PageLayout title="FAQ">
      <header className="max-w-6xl mx-auto flex flex-col gap-1 mb-6">
        <h1 className="mt-0 mb-0">Frequently Asked Questions</h1>
      </header>
      <div className="flex justify-center">
        <div className="block sm:flex max-w-6xl">
          <div className="w-full sm:w-1/3 sm:pr-4">
            <div className="bg-slate-100 rounded-md p-4">
              <ul className="pl-0 my-0">
                <li>
                  <a className="hover:underline" href="#general">
                    <h3 className="my-1">General</h3>
                  </a>
                </li>
                <li className="pl-4">
                  <a className="hover:underline" href="#how-to-get-started">
                    <strong>How to get started</strong>
                  </a>
                </li>
                <li className="pl-8">
                  1. &nbsp;
                  <a className="hover:underline" href="#general-faq-1">
                    Do I need to set up an account with poktpool™?
                  </a>
                </li>
                <li className="pl-8">
                  2. &nbsp;
                  <a className="hover:underline" href="#general-faq-2">
                    How do I set up a new account with poktpool™?
                  </a>
                </li>
                <li className="pl-8">
                  3. &nbsp;
                  <a className="hover:underline" href="#general-faq-3">
                    How do I set up an account as an existing staked member with
                    poktpool™?
                  </a>
                </li>
                <li className="pl-4">
                  <a className="hover:underline" href="#managing-your-account">
                    <strong>Managing your account</strong>
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-4">
                    4. How do I add wallets?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-5">
                    5. How do I interact with my different verified wallets?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-6">
                    6. How do I send POKT to the pool?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-7">
                    7. Is it safe to import my wallet on poktpool™?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-8">
                    8. When can I send POKT to the pool?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-9">
                    9. What happens to my POKT after it&apos;s staked in the
                    pool?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-10">
                    10. How can I check my rewards?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-11">
                    11. How do I sweep my POKT rewards from the pool?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-12">
                    12. How do I withdraw/unstake my POKT tokens from the pool?
                  </a>
                </li>
                <li className="pl-4">
                  <a className="hover:underline" href="#how-to-get-started">
                    <strong>Trading POKT</strong>
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-13">
                    13. Where can I trade POKT?
                  </a>
                </li>
                <li className="pl-4">
                  <a className="hover:underline" href="#other-questions">
                    <strong>Other Questions</strong>
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-14">
                    14. What node service providers does the pool use?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-15">
                    15. How much does staking with poktpool™ cost?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-16">
                    16. How are my rewards determined and how much will I make?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-17">
                    17. What POKT price is used for showing the POKT value vs
                    the balance history and transaction history download?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-18">
                    18. Why don’t the USD amounts on the monthly statement add
                    up to the ending value?
                  </a>
                </li>
                <li className="pl-4">
                  <a className="hover:underline" href="#community">
                    <strong>Community</strong>
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-19">
                    19. What are the various platforms I can use to interact
                    with the poktpool™ community?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-20">
                    20. I want to understand more about Pocket the project and
                    POKT the token, where should I go?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#general-faq-21">
                    21. Some of the DAO proposals might impact my rewards in the
                    pool. How can I participate and voice my opinions?
                  </a>
                </li>
                <li>
                  <a
                    className="hover:underline"
                    href="#staking-transaction-status"
                  >
                    <h3 className="my-1">
                      poktpool™ Staking Transaction Statuses
                    </h3>
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#transaction-awaiting-validation"
                  >
                    Transaction Awaiting Validation
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#transaction-not-exist-on-blockchain"
                  >
                    Transaction Does Not Exist on Blockchain
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#transaction-verified-pending-stake"
                  >
                    Transaction Verified - Pending Stake
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#transaction-staked">
                    Transaction Staked
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#verification-failed-insufficient-funds"
                  >
                    Verification Failed - Insufficient Funds
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#verification-failed-user-wallet-mismatch"
                  >
                    Verification Failed - User Wallet Mismatch
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#verification-failed-dest-wallet-mismatch"
                  >
                    Verification Failed - Destination Wallet Mismatch
                  </a>
                </li>
                <li className="pl-8">
                  <a
                    className="hover:underline"
                    href="#verification-failed-not-found-after-24"
                  >
                    Verification Failed - Not Found After 24 Hours
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#kyc">
                    <h3 className="my-1">KYC</h3>
                  </a>
                </li>
                <li className="pl-4">
                  <a
                    className="hover:underline"
                    href="#identity-photo-verification"
                  >
                    <strong>Identity photo verification</strong>
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#kyc-1">
                    Why am I being asked to complete this process?
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#kyc-2">
                    How do I complete this process?
                  </a>
                </li>
                <li className="pl-4">
                  <a
                    className="hover:underline"
                    href="#id-document-verification"
                  >
                    <strong>
                      Identity document verification troubleshooting
                    </strong>
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#kyc-3">
                    I clicked on the KYC button and nothing happens
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#kyc-4">
                    KYC has been “pending” for a long time
                  </a>
                </li>
                <li className="pl-8">
                  <a className="hover:underline" href="#kyc-5">
                    Additional Tips/Suggestions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full sm:w-2/3 sm:pl-4">
            <h1 id="general">General</h1>
            <div>
              <h2 id="how-to-get-started">How to get started</h2>
              <div id="general-faq-1">
                <h3>1. Do I need to set up an account with poktpool™?</h3>
                <p>
                  Yes! poktpool.com is the best and only way to experience
                  everything poktpool™ has to offer!
                </p>
              </div>
              <div id="general-faq-2">
                <h3>2. How do I set up a new account with poktpool™?</h3>
                <p>
                  First, you must set up a POKT wallet which can be done{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://wallet.pokt.network/"
                  >
                    here
                  </a>
                  . Your personal POKT wallet address is part of your unique
                  identifier as a staker in the pool. You will use this wallet
                  address when creating your account and staking POKT in the
                  pool. Once you have a POKT wallet and some POKT, visit{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/join"
                  >
                    here
                  </a>{' '}
                  and select the “New User” tab.
                </p>
              </div>
              <div id="general-faq-3">
                <h3>
                  3. How do I set up an account as an existing staked member
                  with poktpool™?
                </h3>
                <p>
                  Visit{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/join"
                  >
                    here
                  </a>{' '}
                  and select the “existing staked member” tab. Be sure to
                  enter the email address and wallet address associated with
                  your account. If you do not remember which email address or
                  wallet address you had registered with poktpool™, use the Need
                  Help? button on the website.
                </p>
              </div>
            </div>

            <div id="managing-your-account">
              <h2>Managing your account</h2>
              <div id="general-faq-4">
                <h3>4. How do I add wallets?</h3>
                <p>
                  You must add and verify at least one Pocket wallet in order to
                  stake in poktpool™ and may have up to three wallets.
                </p>
                <p>
                  After logging in, click on the user icon in the upper right
                  corner of the page and select “My Account.” Select the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/account/wallets"
                  >
                    “Wallets”
                  </a>{' '}
                  tab and enter your wallet address under “Add a new wallet”.
                  You may choose to give your wallet a nickname if you wish.
                  Once you click the Add button, there will be a prompt to send
                  a designated, small amount of POKT to the poktpool™ wallet.
                  You must send this verification transaction from the POKT
                  wallet you added within 2 hours in order to be verified. The
                  amount sent will automatically become staked in your account
                  following verification.
                </p>
              </div>
              <div id="general-faq-5">
                <h3>
                  5. How do I interact with my different verified wallets?{' '}
                </h3>
                <p>
                  You interact with the website as one wallet at a time. Your
                  wallet with the largest staked balance will be active when you
                  first log in. To switch wallets, click on the Portfolio tab then click on the name of the wallet you want to interact with. You can also switch by clicking on the user icon in the
                  upper right corner of the page and select “My Account.” Select
                  the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/account/wallets"
                  >
                    “Wallets”
                  </a>{' '}
                  tab and then click on the “Select” radio button for the wallet
                  you wish to interact with.
                </p>
              </div>
              <div id="general-faq-6">
                <h3>6. How do I send POKT to the pool?</h3>
                <p>
                  Once you’ve created your poktpool™ account and verified your
                  identity (KYC), you can start staking POKT in the pool. There
                  are two options for sending POKT to the pool.
                </p>
                <p className="font-semibold">Send and Submit</p>
                <p>
                  Visit your POKT{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://wallet.pokt.network/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    wallet
                  </a>{' '}
                  , then send the amount of POKT you wish to stake to the
                  address found on the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/manage/stake"
                  >
                    staking page
                  </a>
                  . Once complete, copy the transaction hash and paste it into
                  the open field on the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/manage/stake"
                  >
                    staking page
                  </a>
                  . You must ONLY send POKT from your POKT wallet address that
                  is associated with your poktpool account.{' '}
                </p>
                <p className="font-semibold">Import Wallet and Send</p>
                <p>
                  Go to the staking page and choose to import your wallet. You
                  must provide either your.JSON keyfile or private key and
                  passphrase and click import. Once authenticated into your
                  wallet, enter the amount you wish to stake and any memo then
                  click Send.{' '}
                </p>
              </div>
              <div id="general-faq-7">
                <h3>7. Is it safe to import my wallet on poktpool™?</h3>
                <p>
                  Yes, it is safe to import your wallet to stake on poktpool™.
                  When you provide the private key or keyfile and passphrase,
                  authentication takes place directly within your browser. Your
                  private information never leaves your computer and is not
                  transmitted over the internet. Any transaction you send to
                  stake in the pool from an imported wallet is signed within
                  your browser and then sent in an encrypted manner to the
                  blockchain.
                </p>
              </div>
              <div id="general-faq-8">
                <h3>8. When can I send POKT to the pool? </h3>
                <p>
                  Once you have completed the KYC process and been approved and verified a wallet, you
                  can send POKT tokens anytime. The transaction will be
                  processed in the next available tranche. A tranche is when we
                  compound all rewards earned and the new POKT sent in becomes staked.
                </p>
              </div>
              <div id="general-faq-9">
                <h3>
                  9. What happens to my POKT after it&apos;s staked in the pool?
                </h3>
                <p>
                  Once you stake POKT in the pool, your staked POKT earns
                  rewards. You can check the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/analysis"
                  >
                    analytics
                  </a>{' '}
                  page to see the most recent earnings.
                  poktpool™&lsquo;s default is to autocompound your stake - meaning that your rewards become staked to earn additional rewards. You
                  may choose to sweep the rewards - meaning have them sent to you when the tranche closes - or unstake/withdraw at any time
                  by visiting the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/manage/stake"
                  >
                    manage page
                  </a>
                  .
                </p>
              </div>
              <div id="general-faq-10">
                <h3>10. How can I check my rewards?</h3>
                <p>
                  You can see your rewards, balance, and more on your personal{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/manage/dashboard"
                  >
                    Dashboard
                  </a>{' '}
                  page.
                </p>
              </div>
              <div id="general-faq-11">
                <h3>11. How do I sweep my POKT rewards from the pool?</h3>
                <p>
                  You can manage your{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/manage/unstake"
                  >
                    sweep settings
                  </a>{' '}
                  by selecting the “Sweep” tab. Any unswept tokens will be
                  automatically compounded into your total stake, helping you
                  earn even more tokens.
                </p>
              </div>
              <div id="general-faq-12">
                <h3>
                  12. How do I withdraw/unstake my POKT tokens from the pool?{' '}
                </h3>
                <p>
                  You can withdraw your staked tokens from the pool by going to the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/manage/unstake"
                  >
                    Manage
                  </a>{' '}
                  page and selecting the “Unstake” tab. You can choose to unstake a percentage of your stake or a fixed amount of tokens. Once your request has
                  been processed, it will begin a 21-day cooldown period to
                  complete the unstaking process. This is part of Pocket’s protocol. Allow an additional 24 hours to process the
                  unstake. The amount you&apos;re unstaking will not earn
                  rewards during the 21 day cooldown. 
                </p>
              </div>
            </div>

            <div id="trading-pokt">
              <h2>Trading POKT</h2>
              <div id="general-faq-13">
                <h3>13. Where can I trade POKT?</h3>
                <p>
                  You can visit{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://www.coingecko.com/en/coins/pocket-network"
                  >
                    CoinGecko
                  </a>{' '}
                  or{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://coinmarketcap.com/currencies/pocket-network/"
                  >
                    CoinMarketCap
                  </a>{' '}
                  to view the exchanges that offer POKT for trade.
                </p>
              </div>
            </div>

            <div id="other-questions">
              <h2>Other Questions</h2>
              <div id="general-faq-14">
                <h3>14. What node service providers does the pool use? </h3>
                <p>
                  We work with several providers in the space to test for
                  optimization across a number of scenarios. We are consistently
                  reviewing performance on the full fleet of nodes and each
                  provider to ensure the pool is in a healthy state. Working
                  with several different node-running services enables
                  poktpool™ to have a distributed offering that reduces
                  volatility with any one provider.
                </p>
              </div>
              <div id="general-faq-15">
                <h3>15. How much does staking with poktpool™ cost? </h3>
                <p>
                  Currently, poktpool™ takes a share of the rewards earned
                  during each tranche. This means you are{' '}
                  <strong>
                    guaranteed to get rewards and we will never take your staked
                    tokens as fees.
                  </strong>{' '}
                  We are constantly monitoring our costs to provide you with the
                  lowest price possible.
                </p>
              </div>
              <div id="general-faq-16">
                <h3>16. What rewards will I receive for staking? </h3>
                <p>
                  POKT rewards depend on the number of relays being serviced and
                  the number of nodes across the network. Nodes are chosen
                  pseudorandomly to service relays. By pooling your POKT
                  together with others to spin up nodes, you&apos;re increasing your chances
                  of servicing relays. This is why poktpool™ can offer a
                  &ldquo;smoother&rdquo; rewards experience that is often in
                  line with the network average, on a daily basis, as opposed to
                  running your own node that can be much more volatile. Make
                  sure to read up on the Pocket Network{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://docs.pokt.network/home/v0/economics"
                  >
                    economics
                  </a>{' '}
                  to get a better understanding of relays and rewards.
                </p>
              </div>
              <div id="general-faq-17">
                <h3>
                  17. What POKT price is used for showing the POKT value vs the
                  balance history and transaction history download?
                </h3>
                <p>
                  The price of POKT shown on the Dashboard reflects the latest
                  spot price from CoinGecko. This price is updated on poktpool™
                  every 30 minutes. The price shown in the table of balance
                  history on the Dashboard page reflects the average price over
                  the course of the day specified in the row of the table. The
                  transaction history download uses the price closest to the
                  time of the transaction for each row of the file.
                </p>
              </div>
              <div id="general-faq-18">
                <h3>
                  18. Why don’t the USD amounts on the monthly statement add up
                  to the ending value?
                </h3>
                <p>
                  The USD amount of each line item of the monthly statement
                  reflects the value of POKT at that time. For example, the
                  beginning balance shows the value of the POKT based on the
                  POKT price at midnight on the 1st of the month. The ending
                  balance, similarly, is based on the POKT price at midnight on
                  the 1st of the next month. All transactions in between are
                  calculated using the price at the time that they occurred. The
                  changing prices throughout the month mean that the values will
                  not add up cleanly.
                </p>
              </div>
            </div>

            <div id="community">
              <h2>Community</h2>
              <div id="general-faq-19">
                <h3>
                  19. What are the various platforms I can use to interact with
                  the poktpool™ community?{' '}
                </h3>
                <p>
                  We can be found on{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://discord.gg/f4XFVDXaMP"
                  >
                    Discord
                  </a>
                  , with over 8,000 members and growing, as well as{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="http://t.me/poktpool"
                  >
                    Telegram
                  </a>
                  .
                </p>
              </div>
              <div id="general-faq-20">
                <h3>
                  20. I want to understand more about Pocket the project and
                  POKT the token, where should I go?
                </h3>
                <p>
                  There is some really great info that can be found in our very
                  own Discord, starting with the TL:DR channel. Additionally,
                  you can visit the Pocket website and take a deep dive into the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://docs.pokt.network/home/"
                  >
                    protocol
                  </a>
                  ,{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://docs.pokt.network/home/learn/economics/"
                  >
                    economics
                  </a>
                  , and the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://forum.pokt.network/"
                  >
                    forum
                  </a>
                  .
                </p>
              </div>
              <div id="general-faq-21">
                <h3>
                  21. Some of the DAO proposals might impact my rewards in the
                  pool. How can I participate and voice my opinions?
                </h3>
                <p>
                  You can create an account on the{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://forum.pokt.network/"
                  >
                    Pocket Forum
                  </a>{' '}
                  and comment on any proposals. If you&apos;d like to earn a
                  vote in the DAO, there are multiple paths to do so. These
                  paths are based on showing your knowledge of the project
                  and/or contributing to the project in a tangible way -
                  there&apos;s no &ldquo;buying a vote.&rdquo; You can check out
                  some ways to claim your vote{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://docs.pokt.network/home/paths/governor/claim-your-vote"
                  >
                    here
                  </a>
                  .
                </p>
              </div>
            </div>

            <div id="staking-transaction-status">
              <h1>poktpool™ Staking Transaction Statuses</h1>
              <p>
                When you submit a transaction hash to be staked, it must be
                checked against the POKT blockchain to ensure that it is valid.
                Multiple data elements are verified in order to validate the
                transaction:
              </p>
              <ul className="list-disc">
                <li className="list-disc">
                  Sender wallet address - the address from which the transaction
                  originated must match the wallet registered on your account
                </li>
                <li className="list-disc">
                  Destination wallet address - the address to which the
                  transaction was sent must be the staking wallet for the pool
                </li>
                <li className="list-disc">
                  Uniqueness - transaction hashes may only be submitted once
                </li>
              </ul>
              <div id="transaction-awaiting-validation">
                <h3>Transaction Awaiting Validation</h3>
                <p>
                  We have not yet attempted to validate the transaction against
                  the blockchain. The amount will not be shown until the
                  transaction validation is complete.
                </p>
              </div>
              <div id="transaction-not-exist-on-blockchain">
                <h3>Transaction Does Not Exist on Blockchain</h3>
                <p>
                  Transactions are not immediately available on the blockchain.
                  They become available at the close of a block, which may be 15
                  minutes or more from the time it was submitted. This status
                  indicates that we attempted to validate the transaction but it
                  was not yet found. We will reattempt to validate for up to 24
                  hours. Once the transaction is found, the status will change.
                </p>
              </div>
              <div id="transaction-verified-pending-stake">
                <h3>Transaction Verified - Pending Stake</h3>
                <p>
                  Once a transaction has been successfully verified, the amount
                  will be updated and you will see the status change.
                  Transactions do not become fully staked until the next tranche
                  opens.
                </p>
              </div>
              <div id="transaction-staked">
                <h3>Transaction Staked</h3>
                <p>
                  Upon the tranche opening, all verified transactions which had
                  not yet been staked become staked.
                </p>
              </div>
              <div id="verification-failed-insufficient-funds">
                <h3>Verification Failed - Insufficient Funds</h3>
                <p>
                  If you did not have enough POKT in your wallet to complete the
                  transaction when the block closed, you may receive this error.
                  This indicates that the transaction could not be completed
                  because the blockchain could not remove the amount of POKT
                  specified.
                </p>
              </div>
              <div id="verification-failed-user-wallet-mismatch">
                <h3>Verification Failed - User Wallet Mismatch</h3>
                <p>
                  The sender wallet from which the transaction originated did
                  not match the wallet on your account.
                </p>
              </div>
              <div id="verification-failed-dest-wallet-mismatch">
                <h3>Verification Failed - Destination Wallet Mismatch</h3>
                <p>
                  The recipient wallet to which the transaction was sent did not
                  match the poktpool™ wallet for staking.
                </p>
              </div>
              <div id="verification-failed-not-found-after-24">
                <h3>Verification Failed - Not Found After 24 Hours</h3>
                <p>
                  The transaction has been searched in the blockchain for 24
                  hours and has not appeared. This usually occurs because a
                  transaction hash from a different blockchain was entered.
                </p>
              </div>
            </div>

            <div id="kyc">
              <h1>KYC</h1>
              <h2 id="identity-photo-verification">
                Identity photo verification
              </h2>
              <div id="kyc-1">
                <h3>Why am I being asked to complete this process?</h3>
                <p>
                  As a company operating in the United States, we are required
                  to identify users that are interacting with the services on
                  our platform. Identity verification ensures we remain in
                  compliance with Know Your Customer (KYC) and Anti-Money Laundering (AML)
                  laws in the jurisdictions in which we operate, so that we can
                  continue to offer our services to our members. For more
                  details on what information we collect and how we securely
                  store and protect these records, please refer to our{' '}
                  <a
                    className="text-brand-blue-dark underline"
                    href="https://poktpool.com/privacy-policy"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div id="kyc-2">
                <h3>How do I complete this process?</h3>
                <ul>
                  <li>I. Navigate to “My Account”.</li>
                  <li>II. Click “Verify Your Identity”.</li>
                  <li>
                    III. Click “Start” verification to begin the document upload
                    process.
                  </li>
                  <li>
                    IV. Select the Identity Document type that you want to
                    upload. (Passport, Driver&apos;s License, Identity Card).
                  </li>
                  <li>
                    V. Flash must be enabled to complete the upload process. If a pop-up asks you to grant access to your webcam and microphone, click “Allow.”
                  </li>
                  <li>
                    VI. Use your webcam, or phone camera, to scan your
                    Identification Document.
                  </li>
                  <li>
                    VII. Use your webcam, or phone camera to take a photo of
                    your face.
                  </li>
                  <li>
                    VIII. Once you have uploaded all documents, visit “My
                    Account” and allow 2-3 minutes for the verification process
                    to complete. (90% of the cases are accepted by Jumio within
                    that time frame. It can take up to 24 hours)
                  </li>
                </ul>
              </div>
              <h2 id="id-document-verification">
                Identity document verification troubleshooting
              </h2>
              <div id="kyc-3">
                <h3>I clicked on the KYC button and nothing happens</h3>
                <p>
                  This could be due to the use of a pop-up blocker. Try another browser or disable
                  your pop-up blocker. Chrome is the preferred browser.
                </p>
              </div>
              <div id="kyc-4">
                <h3>KYC has been “pending” for a long time</h3>
                <p>
                  It can take up to 48 hours for Jumio to clear a KYC
                  transaction.
                </p>
              </div>
              <div id="kyc-5">
                <h3>Additional Tips/Suggestions</h3>
                <p>
                  When uploading pictures of your ID, always take a colored photo of
                  the document, even when uploading the ID. A scan or digital
                  copy of the document is not accepted.
                </p>
                <p>
                  In addition, do NOT edit the pictures in any way - no
                  covering, no trimming. All of this would prompt Jumio to give
                  “Manipulated copy” or “photocopy” errors. Also make sure to
                  have a plain background and not a lot of light coming from
                  behind or above you.
                </p>
                <p>
                  If using a passport, make sure that a signature is visible.
                </p>
                <p>
                  If using a mobile device, set it up on a table (or something
                  stationary) during face scanning to avoid blurring.
                </p>
                <p>
                  Do not have other people on camera with you during the face scan.
                </p>
                <p>
                  Suggestion for US customers: Please make sure that your
                  personal information is entered exactly as it appears on your
                  government-issued ID. It’s important that your personal information 
                  matches that on your ID and poktpool™ account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default FAQ
