import { Pocket } from '@pokt-network/pocket-js'
import { KeyManager } from '@pokt-foundation/pocketjs-signer'
import { TransactionBuilder } from '@pokt-foundation/pocketjs-transaction-builder'

const rpcURL = 'http://pocketcluster.local:8088'

const POCKET_DISPATCHER = new URL(rpcURL)
const pocket = new Pocket([POCKET_DISPATCHER])

export async function pocketImportWithPrivatekey(
  privatekey: Buffer,
  passphrase: string
) {
  // Import an existing account using the raw private key:
  const importedAccount = await pocket.keybase.importAccount(
    privatekey,
    // The passphrase to encrypt the private key while in memory
    passphrase
  )

  console.log(importedAccount)

  return importedAccount

  // Import an account using the encrypted JSON PPK:
}

export async function pocketImportWithPPK(
  exportedPPK: any,
  passphrase: string
) {
  const importedPPKAccount = await pocket.keybase.importPPK(
    // The PPK passphrase used when the key was exported
    passphrase,
    exportedPPK.salt,
    exportedPPK.secparam,
    exportedPPK.hint,
    exportedPPK.ciphertext,
    // The passphrase to encrypt the private key while in memory
    passphrase
  )

  return importedPPKAccount
}

export async function pocketSendTransactionWithPKey(
  privatekey: string,
  to: string,
  amount: number,
  memo: string
) {
  try {
    const signer = await KeyManager.fromPrivateKey(privatekey)
    const transactionBuilder = new TransactionBuilder({
      provider: {} as any,
      signer,
      chainID: 'mainnet',
    })

    const sendMessage = transactionBuilder.send({
      toAddress: to.toLowerCase(),
      amount: amount.toFixed(0),
    })

    const userAddress = signer.getAddress()

    const rawTx = await transactionBuilder.createTransaction({
      memo,
      txMsg: sendMessage,
    })

    return rawTx.toJSON()
  } catch (e) {}
}

export async function pocketSendTransactionWithPPK(
  exportedPPK: any,
  passphrase: string,
  to: string,
  amount: number,
  memo: string
) {
  try {
    const signer = await KeyManager.fromPPK({
      ppk: JSON.stringify(exportedPPK),
      password: passphrase,
    })

    const transactionBuilder = new TransactionBuilder({
      provider: {} as any,
      signer,
      chainID: 'mainnet',
    })

    const sendMessage = transactionBuilder.send({
      toAddress: to.toLowerCase(),
      amount: amount.toFixed(0),
    })

    const userAddress = signer.getAddress()

    const rawTx = await transactionBuilder.createTransaction({
      memo,
      txMsg: sendMessage,
    })

    return rawTx.toJSON()
  } catch (error) {
    return error
  }
}
