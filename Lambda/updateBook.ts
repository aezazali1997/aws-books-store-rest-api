import * as AWS from "aws-sdk";

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";

const db = new AWS.DynamoDB.DocumentClient();
export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Invalid request body, you are missing parameter body",
    };
  }
  const requestItemId = event.pathParameters.id;
  if (!requestItemId) {
    return {
      statusCode: 400,
      body: "Error!  you are missing the path paramter id",
    };
  }
  const item =
    typeof event.body === "object" ? event.body : JSON.parse(event.body);
  const editedProperties = Object.keys(item);
  if (!item || editedProperties.length < 1) {
    return { statusCode: 400, body: "invalid request, no arguments provided" };
  }
  const firstProperty = editedProperties.splice(0, 1);
  const params: any = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestItemId,
    },
    UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };
  params.ExpressionAttributeValues[`:${firstProperty}`] =
    item[`${firstProperty}`];

  editedProperties.forEach((property) => {
    params.UpdateExpression += `, ${property} = :${property}`;
    params.ExpressionAttributeValues[`:${property}`] = item[property];
  });

  try {
    await db.update(params).promise();
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
