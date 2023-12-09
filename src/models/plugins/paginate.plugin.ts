import { Document, Model, Query, Schema } from "mongoose";

export interface QueryResult {
  results: Document[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
export interface Options {
  sortBy?: string;
  projectBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
  path?: any;
}

const getProject = (projectBy: string | undefined): string => {
  let project = "";
  if (projectBy) {
    const projectionCriteria: string[] = [];
    projectBy.split(",").forEach(projectOption => {
      const [key, include] = projectOption.split(":");
      projectionCriteria.push((include === "hide" ? "-" : "") + key);
    });
    project = projectionCriteria.join(" ");
  } else {
    // project = "-createdAt -updatedAt";
  }
  return project;
};

const paginate = <T extends Document, U extends Model<U>>(
  schema: Schema<T>
): void => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  const newSchema = schema;
  async function paginatefunc(
    this: Model<T>,
    filter: Record<string, null>,
    options: Options
  ): Promise<QueryResult> {
    let sort = "";
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(",").forEach((sortOption: string) => {
        const [key, order] = sortOption.split(":");
        sortingCriteria.push((order === "desc" ? "-" : "") + key);
      });
      sort = sortingCriteria.join(" ");
    } else {
      sort = '-createdAt';
    }

    const limit =
      options.limit && parseInt(options.limit.toString(), 10) > 0
        ? parseInt(options.limit.toString(), 10)
        : 10;
    const page =
      options.page && parseInt(options.page.toString(), 10) > 0
        ? parseInt(options.page.toString(), 10)
        : 1;
    const skip = (page - 1) * limit;
    const countDocuments = this.countDocuments(filter).exec();
    const find: Query<Array<Document>, Document> = this.find(filter);
    let docsPromise = find
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(getProject(options.projectBy));

    if (options.populate) {
      const populateOptions = options.populate.split(",");
      for (let i = populateOptions.length - 1; i >= 0; i -= 1) {
        const populateOption = populateOptions[i];
        const pathParts = populateOption.split(".");
        let populatePath: string | string[];
        const lastPath = pathParts.at(-1) as string;
        populatePath = [lastPath];
        for (let j = pathParts.length - 2; j >= 0; j -= 1) {
          populatePath = [pathParts[j], lastPath];
        }
        docsPromise = docsPromise.populate(populatePath);
      }
    }
    if (options.path) {
      docsPromise = docsPromise.populate(options.path);
    }
    const docsPromiseExec = docsPromise.exec();

    return Promise.all([countDocuments, docsPromiseExec]).then(values => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      return {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
    });
  }

  newSchema.statics.paginate = paginatefunc;
};

export default paginate;
