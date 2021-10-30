import * as AWS from "aws-sdk";

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";

const db = new AWS.DynamoDB.DocumentClient();
export const handler = async (event: any = {}): Promise<any> => {
  const requestItemId = event.pathParameters.id;

  if (!requestItemId) {
    return {
      statusCode: 400,
      body: "Error!  you are missing the path paramter id",
    };
  }
  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestItemId,
    },
  };

  try {
    await db.delete(params).promise();
    return {
      statusCode: 200,
      body: "",
    };
  } catch (err) {
    console.log("DynamoDB Error", err);
    return {
      statusCode: 500,
      body: err,
    };
  }
};
