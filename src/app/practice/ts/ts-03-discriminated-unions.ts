/**
 * TS-03: Discriminated Unions
 * ===========================
 * Concept: Union types, type narrowing, exhaustiveness checking
 *
 * Objective:
 *   Model a payment processing system using discriminated unions so that
 *   TypeScript can narrow types exhaustively inside a switch statement.
 *
 * Requirements:
 *   - Define three payment interfaces: CreditCardPayment, BankTransferPayment, CryptoPayment
 *   - Each must have shared fields: id, amount, status
 *   - Each must have a unique `type` literal field (the discriminant)
 *   - Each must have its own unique fields (see below)
 *   - Write a `processPayment` function using a switch on `payment.type`
 *   - Add exhaustiveness checking so TypeScript warns if a type is unhandled
 *
 * Unique fields per type:
 *   CreditCardPayment:   cardLastFour (string), expiryMonth (number), expiryYear (number)
 *   BankTransferPayment: accountNumber (string), routingNumber (string), bankName (string)
 *   CryptoPayment:       walletAddress (string), currency ('BTC' | 'ETH' | 'USDC')
 *
 * Note: interfaces are named with "Payment" suffix to avoid conflicts with
 * built-in browser globals (e.g. `crypto` is a reserved global in TypeScript's DOM lib)
 *
 * Hints and solution: docs/practice-hints/ts-hints-and-solutions.md
 * How to run:        docs/practice-hints/HOW-TO-RUN.md
 */

// ============================================================
// SOLUTION — write your interfaces, union type, and function here
// ============================================================

// Define your interfaces here:
// CreditCardPayment, BankTransferPayment, CryptoPayment

// Define your Payment union type here:
type Payment = never; // replace never with your union type

// Write your processPayment function here:
function processPayment(payment: Payment): string {
  // your switch statement here
  return '';
}

// ============================================================
// TESTS — do not modify below this line
// ============================================================

console.log('--- TS-03: Discriminated Unions ---\n');

const creditCardPayment = {
  type: 'credit_card' as const,
  id: 'pay_001',
  amount: 99.99,
  status: 'pending' as const,
  cardLastFour: '4242',
  expiryMonth: 12,
  expiryYear: 2027,
};

const bankTransferPayment = {
  type: 'bank_transfer' as const,
  id: 'pay_002',
  amount: 500.00,
  status: 'pending' as const,
  accountNumber: '123456789',
  routingNumber: '987654321',
  bankName: 'First National',
};

const cryptoPayment = {
  type: 'crypto' as const,
  id: 'pay_003',
  amount: 0.05,
  status: 'pending' as const,
  walletAddress: '0xABCDEF1234567890',
  currency: 'ETH' as const,
};

// Test 1: Credit card processing
const creditResult = processPayment(creditCardPayment as unknown as Payment);
const creditPass = creditResult.includes('4242');
console.log('Test 1 - Credit card (includes last four):', creditPass ? '✓' : '✗', '-', creditResult || '(empty)');

// Test 2: Bank transfer processing
const bankResult = processPayment(bankTransferPayment as unknown as Payment);
const bankPass = bankResult.includes('First National');
console.log('Test 2 - Bank transfer (includes bank name):', bankPass ? '✓' : '✗', '-', bankResult || '(empty)');

// Test 3: Crypto processing
const cryptoResult = processPayment(cryptoPayment as unknown as Payment);
const cryptoPass = cryptoResult.includes('ETH');
console.log('Test 3 - Crypto (includes currency):', cryptoPass ? '✓' : '✗', '-', cryptoResult || '(empty)');

// Test 4: All results are non-empty strings
const allStrings = [creditResult, bankResult, cryptoResult].every(r => typeof r === 'string' && r.length > 0);
console.log('Test 4 - All results are non-empty strings:', allStrings ? '✓' : '✗');

console.log('\n--- All tests complete ---');
console.log('All rows should show ✓');
console.log('\nBonus: Try adding a new payment type to the Payment union without');
console.log('adding a case to the switch. TypeScript should show a compile error.');