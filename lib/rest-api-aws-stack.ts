import * as cdk from '@aws-cdk/core';
import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import { AttributeType, Table } from "@aws-cdk/aws-dynamodb";
export class RestApiAwsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // dynamo db table with partition key

    const dynamodb = new Table(this, "books", {
      partitionKey: {
        name: "bookId",
        type: AttributeType.STRING,
      },
      tableName: "books",
    });

    // creating lambda functions

    const getAllLambdas = new lambda.Function(this, "getAllBooks", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "getAllBooks.handler",
      code: lambda.Code.fromAsset("Lambda"),
      memorySize: 1024,
      environment: {
        PRIMARY_KEY: "bookId",
        TABLE_NAME: dynamodb.tableName,
      },
    });

    const getOneLambda = new lambda.Function(this, "getOneBook", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "getOneBook.handler",
      code: lambda.Code.fromAsset("Lambda"),
      memorySize: 1024,
      environment: {
        PRIMARY_KEY: "bookId",
        TABLE_NAME: dynamodb.tableName,
      },
    });

    const createOneLambda = new lambda.Function(this, "addBook", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "addBook.handler",
      code: lambda.Code.fromAsset("Lambda"),
      memorySize: 1024,
      environment: {
        PRIMARY_KEY: "bookId",
        TABLE_NAME: dynamodb.tableName,
      },
    });

    const updateOneLambda = new lambda.Function(this, "updateBook", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "updateBook.handler",
      code: lambda.Code.fromAsset("Lambda"),
      memorySize: 1024,
      environment: {
        PRIMARY_KEY: "bookId",
        TABLE_NAME: dynamodb.tableName,
      },
    });

    const deleteOneLambda = new lambda.Function(this, "deleteBook", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "deleteBook.handler",
      code: lambda.Code.fromAsset("Lambda"),
      memorySize: 1024,
      environment: {
        PRIMARY_KEY: "bookId",
        TABLE_NAME: dynamodb.tableName,
      },
    });

    // grant permisions to lambdas

    dynamodb.grantReadWriteData(getAllLambdas);
    dynamodb.grantReadWriteData(getOneLambda);
    dynamodb.grantReadWriteData(updateOneLambda);
    dynamodb.grantReadWriteData(deleteOneLambda);
    dynamodb.grantReadWriteData(createOneLambda);

    // integrating lambdas

    const getAllIntegration = new LambdaIntegration(getAllLambdas);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const updateOneIntegration = new LambdaIntegration(updateOneLambda);
    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    // create rest api

    const bookAPI = new RestApi(this, "booksApi", {
      restApiName: "Simple books api",
    });

    const resource = bookAPI.root.addResource("books");
    resource.addMethod("GET", getAllIntegration);
    resource.addMethod("POST", createOneIntegration);

    const singleResource = resource.addResource("{id}");
    singleResource.addMethod("GET", getOneIntegration);
    singleResource.addMethod("PATCH", updateOneIntegration);
    singleResource.addMethod("DELETE", deleteOneIntegration);
    addCORS(singleResource);
  }
}
export function addCORS(apiResource: IResource) {
  apiResource.addMethod(
    "Options",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode":200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
