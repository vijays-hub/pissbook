/**
 * Ky is a tiny and elegant HTTP client based on the Fetch API
 *
 * More on KY network client - https://github.com/sindresorhus/ky
 */
import ky from "ky";

/**
 * Creating a custom configuration for ky instance.
 *
 * Usually, when we return any data from REST endpoints, that data would be in JSON format.
 * Meaning, the data is serialized in JSON format. So, raw Date objects are converted to string.
 * We can define a custom parseJson function for our ky instance to parse the JSON data and convert
 * the data into our desired format. In this case, we are converting the stringified Date objects.
 *
 */
const kyInstance = ky.create({
  parseJson(text) {
    return JSON.parse(text, (key, value) => {
      /**
       * Since we are using Prisma, we usually have fields like createdAt, updatedAt, etc.
       * So, if we can check if the key ends with 'At', we can convert the value to Date object.
       */
      if (key.endsWith("At")) {
        return new Date(value);
      }
      return value;
    });
  },
});

export default kyInstance;
