/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("test");

// Search for documents in the current collection.
// db.getCollection("TemporarySignup").find(
//   {
//     email: "osuchukwudavid@gmail.com", // Filter by phone number
//   }
//     {
//       /*
//        * Filter
//        * fieldA: value or expression
//        */
//     },
//     {
//       /*
//        * Projection
//        * _id: 0, // exclude _id
//        * fieldA: 1 // include field
//        */
//     }
// );
//   .sort({
//     /*
//      * fieldA: 1 // ascending
//      * fieldB: -1 // descending
//      */
//   });

// Find and drop an index
// db.temporarysignups.dropIndex("referralCode_1");
db.temporarysignups.createIndex(
  { referralCode: 1 },
  {
    unique: true,
    partialFilterExpression: { referralCode: { $exists: true, $ne: null } },
  }
);
