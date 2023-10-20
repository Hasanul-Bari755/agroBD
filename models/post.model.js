import mongoose from "mongoose";
import Product from "./post.schema";
import User from "./user.schema";
import connectDB from "./mongoose";
const itemsPerPage = 6;
export async function setProductLocation() {
  await connectDB();
  const data = await Product.aggregate()
    .lookup({
      from: "users",
      localField: "seller",
      foreignField: "_id",
      as: "sellerDetails",
    })
    .unwind({
      path: "$sellerDetails",
      preserveNullAndEmptyArrays: true,
    })
    .project({
      sellerLocationBn: "$sellerDetails.locationBn",
      sellerLocation: "$sellerDetails.location",
    });
  const bulkUpdateOperations = data.map(async (doc) => {
    const nId = new mongoose.Types.ObjectId(doc._id);
    console.log(nId);
    const res = Product.updateOne(
      { _id: nId },
      {
        $set: {
          sellerLocation: doc.sellerLocation,
          sellerLocationBn: doc.sellerLocationBn,
        },
      }
    );
    console.log(res);
  });
  console.log(bulkUpdateOperations);
  await Promise.all(bulkUpdateOperations);

  //const r = await Product.bulkWrite(bulkUpdateOperations);
  //console.log(r);

  return data;
}
export async function createPostModel(postData) {
  const newPost = new Product({ ...postData });
  const result = await newPost.save();
  if (result) {
    return true;
  } else {
    return false;
  }
}
export async function getProductDataModel1(id) {
  console.log(id);
  const nId = new mongoose.Types.ObjectId(id);
  const result1 = await Product.aggregate([
    {
      $match: { _id: nId },
    },
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "sellerDetails",
      },
    },
    {
      $unwind: "$sellerDetails",
    },
    {
      $project: {
        _id: 0,
        userDetails: {
          name: "$sellerDetails.name",
          photo: "$sellerDetails.photo",
        },
        productDetails: {
          $mergeObjects: ["$$ROOT"],
        },
      },
    },
    {
      $unset: "productDetails.sellerDetails",
    },
    {
      $sort: { "productDetails.createdAt": 1 },
    },
  ]);
  console.log(result1);
  return result1;
}
export async function getProductDataModel(id) {
  let status = false;
  let result;
  try {
    result = await Product.findById(id).exec();
    if (result) {
      status = true;
    }
  } catch (err) {
    console.log(err);
  }
  return {
    status: status,
    data: result,
  };
}
export async function getUserPostsModel(id) {
  try {
    const userData = await User.findById(id).select("name photo email _id");
    const userProducts = await Product.find({ seller: id }).sort({
      createdAt: -1,
    });
    const data = {
      user: userData,
      posts: userProducts,
    };
    // const uId = new mongoose.Types.ObjectId(id);
    // const fakeAggreation = await User.aggregate([
    //   { $match: { _id: uId } },
    //   {
    //     $lookup: {
    //       from: "products",
    //       foreignField: "seller",
    //       localField: "_id",
    //       as: "posts",
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       photo: 1,
    //       email: 1,
    //       _id,
    //       posts: {
    //         $sort: { createdAt: -1 },
    //       },
    //     },
    //   },
    // ]);

    // console.log(userPosts,'xxx');
    return { status: true, data };
  } catch (err) {
    console.log(err);
    return { status: false };
  }
}

export async function getAllPostsModel(page) {
  // Set the desired number of items per page

  // Calculate the total number of posts
  const totalItems = await Product.countDocuments();

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate the pagination values for the given page
  const limit = itemsPerPage;
  const skip = (page - 1) * itemsPerPage;

  // Fetch the posts for the given page
  const result = await Product.find()
    .select("-updatedAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  // Get the list of seller IDs from the fetched posts
  const sellerIds = result.map((post) => post.seller);

  // Fetch the seller data for each post using the IDs
  const sellerData = await User.find({ _id: { $in: sellerIds } }).select(
    "name photo _id"
  );
  console.log(sellerData, "sd"); // Create a map of seller data using the seller IDs
  const sellerDataMap = sellerData.reduce((map, seller) => {
    map[seller._id] = seller;
    return map;
  }, {});
  console.log(sellerDataMap);
  // Populate the seller data for each post
  const postPopulate = result.map((post) => {
    const sellerId = post.seller.toString();
    const seller = sellerDataMap[sellerId];
    return { ...post.toObject(), sellerData: seller };
  });

  return { postPopulate, totalPages };
}
