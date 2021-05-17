/**
 * This is a WebAssembly build of SQLite with experimental support for
 * writing SQLite virtual file systems and modules (for virtual tables)
 * in Javascript. Also see the
 * [GitHub repository](https://github.com/rhashimoto/wa-sqlite) and the
 * [online demo](https://rhashimoto.github.io/wa-sqlite/demo/).
 */

/**
 *  Javascript types that SQLite can use
 * 
 * C integer and floating-point types both map to/from Javascript `number`.
 * Blob data can be provided to SQLite as `Int8Array` or `number[]` (with
 * each element converted to a byte); SQLite always returns blob data as
 * `Int8Array`
 */
type SQLiteCompatibleType = number|string|Int8Array|Array<number>|null;

/**
 * SQLite Virtual File System object
 * 
 * Objects with this interface can be passed to {@link SQLiteAPI.vfs_register}
 * to define a new filesystem.
 * 
 * There are examples of a synchronous
 * [MemoryVFS.js](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/MemoryVFS.js),
 * and asynchronous
 * [MemoryAsyncVFS.js](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/MemoryAsyncVFS.js)
 * and
 * [IndexedDbVFS.js](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/IndexedDbVFS.js).
 * 
 * @see https://sqlite.org/vfs.html
 * @see https://sqlite.org/c3ref/io_methods.html
 */
declare interface SQLiteVFS {
  /** Maximum length of a file path in UTF-8 bytes (default 64) */
  mxPathName?: number;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xClose(fileId: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xRead(
    fileId: number,
    pData: { size: number, value: Int8Array},
    iOffset: number
  ): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xWrite(
    fileId: number,
    pData: { size: number, value: Int8Array},
    iOffset: number
  ): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xTruncate(fileId: number, iSize: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xSync(fileId: number, flags: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xFileSize(
    fileId: number,
    pSize64: { set(value: number): void }
  ): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xLock(fileId: number, flags: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xUnlock(fileId: number, flags: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xCheckReservedLock(
    fileId: number,
    pResOut: { set(value: number): void }
  ): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xFileControl(
    fileId: number,
    flags: number,
    pOut: { value: Int8Array }
  ): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xDeviceCharacteristics(fileId: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/vfs.html */
  xOpen(
    name: string|null,
    fileId: number,
    flags: number,
    pOutFlags: { set(value: number): void }
  ): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/vfs.html */
  xDelete(name: string, syncDir: number): number|Promise<number>;

  /** @see https://sqlite.org/c3ref/vfs.html */
  xAccess(
    name: string,
    flags: number,
    pResOut: { set(value): void }
  ): number|Promise<number>;
}

/**
 * This object is passed by SQLite to implementations of
 * {@link SQLiteModule.xBestIndex}
 * @see https://sqlite.org/c3ref/index_info.html
 */
declare interface SQLiteModuleIndexInfo {
  nConstraint: number,
  aConstraint: Array<{
    iColumn: number,
    op: number,
    usable: boolean
  }>,
  nOrderBy: number,
  aOrderBy: Array<{
    iColumn: number,
    desc: boolean
  }>,
  aConstraintUsage: Array<{
    argvIndex: number,
    omit: boolean
  }>,
  idxNum: number,
  idxStr: string|null,
  orderByConsumed: boolean,
  estimatedCost: number,
  estimatedRows: number,
  idxFlags: number,
  colUsed: number
}

/**
 * SQLite Module object
 * 
 * Objects with this interface can be passed to {@link SQLiteAPI.create_module}
 * to define a module for virtual tables.
 * 
 * There is an example
 * [ArrayModule.js](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/ArrayModule.js)
 * that allows a virtual table to reference a Javascript array.
 * 
 * @see https://sqlite.org/vtab.html
 */
declare interface SQLiteModule {
  /**
   * @see https://sqlite.org/vtab.html#the_xcreate_method
   */
  xCreate?(
    db: number,
    appData,
    argv: string[],
    pVTab: number,
    pzErr: { set(value: string): void }
  ): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xconnect_method
   */
  xConnect(
    db: number,
    appData,
    argv: string[],
    pVTab: number,
    pzErr: { set(value: string): void }
  ): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xbestindex_method
   */
  xBestIndex(pVTab: number, indexInfo: SQLiteModuleIndexInfo): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xdisconnect_method
   */
  xDisconnect(pVTab: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xdestroy_method
   */
  xDestroy(pVTab: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xopen_method
   */
  xOpen(pVTab: number, pCursor: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xclose_method
   */
  xClose(pCursor: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xfilter_method
   */
  xFilter(
    pCursor: number,
    idxNum: number,
    idxString: string|null,
    values: number[]
  ): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xnext_method
   */
  xNext(pCursor: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xeof_method
   */
  xEof(pCursor: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xcolumn_method
   */
  xColumn(pCursor: number, pContext: number, iCol: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xrowid_method
   */
  xRowid(pCursor: number, pRowid: { set(value: number): void }): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xupdate_method
   */
  xUpdate(
    pVTab: number,
    values: number[],
    pRowId: { set(value: number): void }): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xbegin_method
   */
  xBegin?(pVTab: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xsync_method
   */
  xSync?(pVTab: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xcommit_method
   */
  xCommit?(pVTab: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xrollback_method
   */
  xRollback?(pVTab: number): number|Promise<number>;

  /**
   * @see https://sqlite.org/vtab.html#the_xrename_method
   */
  xRename?(pVTab: number, zNew: string): number|Promise<number>;
}

/**
 * Javascript wrappers for the SQLite C API (plus a few convenience functions)
 * 
 * Function signatures have been slightly modified to be more
 * Javascript-friendly. For the C functions that return an error code,
 * the corresponding Javascript wrapper will throw an exception with a
 * `code` property on an error.
 * 
 * Note that a few functions return a Promise in order to accomodate
 * either a synchronous or asynchronous SQLite build, generally those
 * involved with opening/closing a database or executing a statement.
 * 
 * To create an instance of the API, follow these steps:
 * 
 * ```javascript
 * // Import an ES6 module factory function from one of the
 * // package builds, either 'wa-sqlite.mjs' (synchronous) or
 * // 'wa-sqlite-async.mjs' (asynchronous). You should only
 * // use the asynchronous build if you plan to use an
 * // asynchronous VFS or module.
 * import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs';
 * 
 * // Import the API.
 * import * as SQLite from 'wa-sqlite';
 * 
 * // Invoke the ES6 module factory to create the SQLite
 * // Emscripten module. This will fetch and compile the
 * // .wasm file.
 * const apiPromise = SQLiteESMFactory().then(module => {
 *   // Use the module to build the API instance. 
 *   return SQLite.Factory(module);
 * });
 * 
 * // Resolve the API instance in the Promise and use it
 * // inside an async function like this:
 * (async function() {
 *   const sqlite3 = await apiPromise;
 *   const db = await sqlite3.open_v2('myDB');
 *   ...
 * })();
 * ```
 * 
 * @see https://sqlite.org/c3ref/funclist.html
 */
declare interface SQLiteAPI {
  /**
   * Bind a collection of values to a statement
   * 
   * This convenience function binds values from either an array or object
   * to a prepared statement with placeholder parameters.
   * 
   * Array example using numbered parameters (numbering is implicit in
   * this example):
   * ```
   * const str = sqlite3.str_new(db, `
   *   INSERT INTO tbl VALUES (?, ?, ?);
   * `);
   * const prepared = await sqlite3.prepare_v2(db, sqlite3.str_value(str));
   * sqlite3.bind_collection(prepared.stmt, [42, 'hello', null]);
   * ...
   * ```
   * 
   * Object example using named parameters (':', '@', or '$' prefixes
   * are allowed):
   * ```
   * const str = sqlite3.str_new(db, `
   *   INSERT INTO tbl VALUES (@foo, @bar, @baz);
   * `);
   * const prepared = await sqlite3.prepare_v2(db, sqlite3.str_value(str));
   * sqlite3.bind_collection(prepared.stmt, {
   *   '@foo': 42,
   *   '@bar': 'hello',
   *   '@baz': null,
   * });
   * ...
   * ```
   * 
   * Note that SQLite bindings are indexed beginning with 1, but when
   * binding values from an array `a` the values begin with `a[0]`.
   * @param stmt prepared statement pointer
   * @param bindings 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_collection(
    stmt: number,
    bindings: {[index: string]: SQLiteCompatibleType|null}|Array<SQLiteCompatibleType|null>
  ): number;

  /**
   * Bind value to prepared statement
   * 
   * This convenience function calls the appropriate `bind_*` function
   * based on the type of `value`. Note that binding indices begin with 1.
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind(stmt: number, i: number, value: SQLiteCompatibleType|null): number;

  /**
   * Bind blob to prepared statement parameter
   * 
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_blob(stmt: number, i: number, value: Int8Array|Array<number>): number;

  /**
   * Bind number to prepared statement parameter
   * 
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value 
   * @returns `SQLITE_OK` (throws exception on error)
   */
   bind_double(stmt: number, i: number, value: number): number;

   /**
   * Bind number to prepared statement parameter
   * 
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_int(stmt: number, i: number, value: number): number;

   /**
   * Bind null to prepared statement
   * 
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param value 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_null(stmt: number, i: number): number;

  /**
   * Get number of bound parameters
   * @see https://www.sqlite.org/c3ref/bind_parameter_count.html
   * @param stmt prepared statement pointer
   * @returns number of statement binding locations
   */
  bind_parameter_count(stmt: number): number;

  /**
   * Get name of bound parameter
   * 
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_parameter_name.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @returns binding name
   */
  bind_parameter_name(stmt: number, i: number): string;

   /**
   * Bind string to prepared statement
   * 
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_text(stmt: number, i: number, value: string): number;

  /**
   * Get count of rows modified by last insert/update
   * @see https://www.sqlite.org/c3ref/changes.html
   * @param db database pointer
   * @returns number of rows modified
   */
  changes(db): number;

  /**
   * Close database connection
   * @see https://www.sqlite.org/c3ref/close.html
   * @param db database pointer
   * @returns `SQLITE_OK` (throws exception on error)
   */
  close(db): Promise<number>;

  /**
   * Call the appropriate `column_*` function based on the column type
   * 
   * The type is determined by calling {@link column_type}, which may
   * not match the type declared in `CREATE TABLE`.
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column(stmt: number, i: number): SQLiteCompatibleType;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * 
   * The contents of the returned buffer may be invalid after the
   * next SQLite call. Make a copy of the data (e.g. with `.slice()`)
   * if longer retention is required.
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_blob(stmt: number, i: number): Int8Array;

  /**
   * Get storage size for column text or blob
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns number of bytes in column text or blob
   */
  column_bytes(stmt: number, i: number): number;

  /**
   * Get number of columns for a prepared statement
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @returns number of columns
   */
  column_count(stmt: number): number;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_double(stmt: number, i: number): number;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_int(stmt: number, i: number): number;

  /**
   * Get a column name for a prepared statement
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column name
   */
  column_name(stmt: number, i: number): string;

  /**
   * Get names for all columns of a prepared statement
   * @param stmt 
   * @returns array of column names
   */
  column_names(stmt: number): Array<string>;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_text(stmt: number, i: number): string;

  /**
   * Get column type for a prepared statement
   * 
   * Note that this type may not match the type declared in `CREATE TABLE`.
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns enumeration value for type
   */
  column_type(stmt: number, i: number): number;

  /**
   * Create or redefine SQL functions
   * @see https://sqlite.org/c3ref/create_function.html
   * @param db database pointer
   * @param zFunctionName 
   * @param nArg number of function arguments
   * @param eTextRep text encoding (and other flags)
   * @param pApp application data
   * @param xFunc 
   * @param xStep 
   * @param xFinal 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  create_function(
    db: number,
    zFunctionName: string,
    nArg: number,
    eTextRep: number,
    pApp: number,
    xFunc?: (context: number, values: Uint32Array) => void,
    xStep?: (context: number, values: Uint32Array) => void,
    xFinal?: (context: number) => void): number;

  /**
   * Create a SQLite module for virtual tables
   * @see https://www.sqlite.org/c3ref/create_module.html
   * @param db database pointer
   * @param zName 
   * @param module 
   * @param appData 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  create_module(db: number, zName: string, module: SQLiteModule, appData?): number;

  /**
   * Get number of columns in current row of a prepared statement
   * @see https://www.sqlite.org/c3ref/data_count.html
   * @param stmt prepared statement pointer
   * @returns number of columns
   */
  data_count(stmt: number): number;

  /**
   * Declare the schema of a virtual table in module
   * {@link SQLiteModule.xCreate} or {@link SQLiteModule.xConnect}
   * methods
   * @see https://www.sqlite.org/c3ref/declare_vtab.html
   * @param db database pointer
   * @param zSQL schema declaration
   * @returns `SQLITE_OK` (throws exception on error)
   */
  declare_vtab(db: number, zSQL: string): number;

  /**
   * One-step query execution interface
   * @see https://www.sqlite.org/c3ref/exec.html
   * @param db database pointer
   * @param zSQL queries
   * @param callback called for each output row
   * @returns Promise resolving to `SQLITE_OK` (rejects on error)
   */
  exec(
    db: number,
    zSQL: string,
    callback?: (row: Array<SQLiteCompatibleType|null>, columns: string[]) => void
  ): Promise<number>;

  /**
   * Destroy a prepared statement object compiled with {@link prepare_v2}
   * @see https://www.sqlite.org/c3ref/finalize.html
   * @param stmt prepared statement pointer
   * @returns Promise resolving to `SQLITE_OK` (rejects on error)
   */
  finalize(stmt: number): Promise<number>;

  /**
   * Get SQLite library version
   * @see https://www.sqlite.org/c3ref/libversion.html
   * @returns version string, e.g. '3.35.5'
   */
  libversion(): string;

  /**
   * Get SQLite library version
   * @see https://www.sqlite.org/c3ref/libversion.html
   * @returns version number, e.g. 3035005
   */
  libversion_number(): number

  /**
   * Opening a new database connection.
   * 
   * Note that this function differs from the C API in that it
   * returns the Promise-wrapped database pointer (instead of a
   * result code).
   * @see https://sqlite.org/c3ref/open.html
   * @param zFilename 
   * @param iFlags `SQLite.CREATE | SQLite.READWRITE` (0x6) if omitted
   * @param zVfs VFS name
   * @returns Promise-wrapped database pointer.
   */
  open_v2(
    zFilename: string,
    iFlags?: number,
    zVfs?: string    
  ): Promise<number>;

  /**
   * Compile an SQL statement
   * 
   * SQL is provided as a pointer in WASM memory, so the utility functions
   * {@link str_new} and {@link str_value} should be used. The returned
   * Promise-wrapped object provides both the prepared statement and a
   * pointer to the still uncompiled SQL that can be used with the next
   * call to this function. A Promise containing `null` is returned
   * when no statement remains.
   * 
   * Each prepared statement should be destroyed with {@link finalize}
   * after its usage is complete.
   * 
   * Code using {@link prepare_v2} generally looks like this:
   * ```javascript
   * const str = sqlite3.str_new(db, sql);
   * try {
   *   // Traverse and prepare the SQL, statement by statement.
   *   let prepared = { stmt: null, sql: sqlite3.str_value(str) };
   *   while ((prepared = await sqlite3.prepare_v2(db, prepared.sql))) {
   *     try {
   *       // Step through the rows produced by the statement.
   *       while (await sqlite3.step(prepared.stmt) === SQLite.SQLITE_ROW) {
   *         // Do something with the row data...
   *       }
   *     } finally {
   *       sqlite3.finalize(prepared.stmt);
   *     }
   *   }
   * } finally {
   *   sqlite3.str_finish(str);
   * }
   * ```
   * @see https://www.sqlite.org/c3ref/prepare.html
   * @param db database pointer
   * @param sql SQL pointer
   * @returns Promise-wrapped object containing the prepared statement
   * pointer and next SQL pointer, or a Promise containing `null` when
   * no statement remains
   */
  prepare_v2(db: number, sql: number): Promise<{ stmt: number, sql: number}|null>;

  /**
   * Reset a prepared statement object
   * @see https://www.sqlite.org/c3ref/reset.html
   * @param stmt prepared statement pointer
   * @returns `SQLITE_OK` (throws exception on error)
   */
  reset(stmt: number): number;

  /**
   * Convenience function to call `result_*` based of the type of `value`
   * @param context context pointer
   * @param value 
   */
  result(context: number, value: (SQLiteCompatibleType|number[])|null): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value 
   */
  result_blob(context: number, value: Int8Array|number[]): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value 
   */
  result_double(context: number, value: number): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value 
   */
  result_int(context: number, value: number): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   */
  result_null(context: number): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value 
   */
   result_text(context: number, value: string): void;

   /**
    * Get all column data for a row from a prepared statement step
    * @param stmt prepared statement pointer
    * @returns row data
    */
  row(stmt: number): Array<SQLiteCompatibleType|null>;

  /**
   * Get statement SQL
   * @param stmt prepared statement pointer
   * @returns SQL
   */
  sql(stmt: number): string;

  /**
   * Evaluate an SQL statement
   * @see https://www.sqlite.org/c3ref/step.html
   * @param stmt prepared statement pointer
   * @returns Promise resolving to `SQLITE_OK` (rejects on error)
   */
  step(stmt: number): Promise<number>;

  /**
   * Create a new `sqlite3_str` dynamic string instance
   * 
   * The purpose for `sqlite3_str` is to transfer a SQL string in
   * Javascript to WebAssembly memory for use with {@link prepare_v2}.
   * 
   * An optional initialization argument has been added for convenience
   * which is functionally equivalent to (but slightly more efficient):
   *  ```javascript
   *  const str = sqlite3.str_new(db);
   *  sqlite3.str_appendall(str, s);
   *  ```
   * 
   * A `sqlite3_str` instance should always be destroyed with
   * {@link str_finish} after use to avoid a resource leak.
   * 
   *  See https://www.sqlite.org/c3ref/str_append.html
   * @param db database pointer
   * @param s optional initialization string
   * @returns `sqlite3_str` pointer
   */
  str_new(db: number, s?:string): number;

  /**
   * Add content to a `sqlite3_str` dynamic string
   * 
   * Not recommended for building strings incrementally; prefer using
   * Javascript and {@link str_new} with initialization.
   * @see https://www.sqlite.org/c3ref/str_append.html
   * @param str `sqlite3_str` pointer
   * @param s string to append
   */
  str_appendall(str: number, s: string): void;

  /**
   * Get pointer to `sqlite3_str` dynamic string data
   * 
   * The returned pointer points to the UTF-8 encoded string in
   * WebAssembly memory. Use as input with {@link prepare_v2}.
   * @param str `sqlite3_str` pointer
   * @returns pointer to string data
   */
  str_value(str: number): number;

  /**
   * Finalize a `sqlite3_str` dynamic string created with {@link str_new}
   * @see https://www.sqlite.org/c3ref/str_append.html
   * @param str `sqlite3_str` pointer
   */
  str_finish(str: number): void;

  /**
   * Get application data in custom function implementation
   * @see https://sqlite.org/c3ref/user_data.html
   * @param context context pointer
   * @returns application data
   */
  user_data(context: number): any;

  /**
   * Extract a value from `sqlite3_value`
   * 
   * This is a convenience function that calls the appropriate `value_*`
   * function based on its type.
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value(pValue: number): SQLiteCompatibleType;

  /**
   * Extract a value from `sqlite3_value`
   * 
   * The contents of the returned buffer may be invalid after the
   * next SQLite call. Make a copy of the data (e.g. with `.slice()`)
   * if longer retention is required.
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_blob(pValue: number): Int8Array;

  /**
   * Get blob or text size for value
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns size
   */
  value_bytes(pValue: number): number;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_double(pValue: number): number;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_int(pValue: number): number;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_text(pValue: number): string;

  /**
   * Get type of `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns enumeration value for type
   */
  value_type(pValue: number): number;
  
  /**
   * Register a new Virtual File System.
   * 
   * @see https://www.sqlite.org/c3ref/str_append.html
   * @param vfs VFS object
   * @param makeDefault 
   * @returns `SQLITE_OK` (throws exception on error)
   */
  vfs_register(vfs: SQLiteVFS, makeDefault?: boolean): number;
}

/** @ignore */
declare module 'wa-sqlite' {
  /**
   * Builds a Javascript API from the Emscripten module. This API is still
   * low-level and closely corresponds to the C API exported by the module,
   * but differs in some specifics like throwing exceptions on errors.
   * @param {*} Module SQLite module
   * @returns {SQLiteAPI}
   */
  export function Factory(Module: any): SQLiteAPI;
  export const SQLITE_OK: 0;
  export const SQLITE_ERROR: 1;
  export const SQLITE_BUSY: 5;
  export const SQLITE_NOMEM: 7;
  export const SQLITE_READONLY: 8;
  export const SQLITE_IOERR: 10;
  export const SQLITE_IOERR_SHORT_READ: 522;
  export const SQLITE_NOTFOUND: 12;
  export const SQLITE_CANTOPEN: 14;
  export const SQLITE_MISUSE: 21;
  export const SQLITE_NOTADB: 26;
  export const SQLITE_NOTICE: 27;
  export const SQLITE_WARNING: 28;
  export const SQLITE_ROW: 100;
  export const SQLITE_DONE: 101;
  export const SQLITE_OPEN_READONLY: 1;
  export const SQLITE_OPEN_READWRITE: 2;
  export const SQLITE_OPEN_CREATE: 4;
  export const SQLITE_OPEN_DELETEONCLOSE: 8;
  export const SQLITE_OPEN_EXCLUSIVE: 16;
  export const SQLITE_OPEN_AUTOPROXY: 32;
  export const SQLITE_OPEN_URI: 64;
  export const SQLITE_OPEN_MEMORY: 128;
  export const SQLITE_OPEN_MAIN_DB: 256;
  export const SQLITE_OPEN_TEMP_DB: 512;
  export const SQLITE_OPEN_TRANSIENT_DB: 1024;
  export const SQLITE_OPEN_MAIN_JOURNAL: 2048;
  export const SQLITE_OPEN_TEMP_JOURNAL: 4096;
  export const SQLITE_OPEN_SUBJOURNAL: 8192;
  export const SQLITE_OPEN_SUPER_JOURNAL: 16384;
  export const SQLITE_OPEN_NOMUTEX: 32768;
  export const SQLITE_OPEN_FULLMUTEX: 65536;
  export const SQLITE_OPEN_SHAREDCACHE: 131072;
  export const SQLITE_OPEN_PRIVATECACHE: 262144;
  export const SQLITE_OPEN_WAL: 524288;
  export const SQLITE_OPEN_NOFOLLOW: 16777216;
  export const SQLITE_IOCAP_ATOMIC: 1;
  export const SQLITE_IOCAP_ATOMIC512: 2;
  export const SQLITE_IOCAP_ATOMIC1K: 4;
  export const SQLITE_IOCAP_ATOMIC2K: 8;
  export const SQLITE_IOCAP_ATOMIC4K: 16;
  export const SQLITE_IOCAP_ATOMIC8K: 32;
  export const SQLITE_IOCAP_ATOMIC16K: 64;
  export const SQLITE_IOCAP_ATOMIC32K: 128;
  export const SQLITE_IOCAP_ATOMIC64K: 256;
  export const SQLITE_IOCAP_SAFE_APPEND: 512;
  export const SQLITE_IOCAP_SEQUENTIAL: 1024;
  export const SQLITE_IOCAP_UNDELETABLE_WHEN_OPEN: 2048;
  export const SQLITE_IOCAP_POWERSAFE_OVERWRITE: 4096;
  export const SQLITE_IOCAP_IMMUTABLE: 8192;
  export const SQLITE_IOCAP_BATCH_ATOMIC: 16384;
  export const SQLITE_INTEGER: 1;
  export const SQLITE_FLOAT: 2;
  export const SQLITE_TEXT: 3;
  export const SQLITE_BLOB: 4;
  export const SQLITE_NULL: 5;
  export const SQLITE_STATIC: 0;
  export const SQLITE_TRANSIENT: -1;
  export const SQLITE_UTF8: 1;
  export const SQLITE_UTF16LE: 2;
  export const SQLITE_UTF16BE: 3;
  export const SQLITE_UTF16: 4;
  export const SQLITE_INDEX_CONSTRAINT_EQ : 2;
  export const SQLITE_INDEX_CONSTRAINT_GT : 4;
  export const SQLITE_INDEX_CONSTRAINT_LE : 8;
  export const SQLITE_INDEX_CONSTRAINT_LT : 16;
  export const SQLITE_INDEX_CONSTRAINT_GE : 32;
  export const SQLITE_INDEX_CONSTRAINT_MATCH : 64;
  export const SQLITE_INDEX_CONSTRAINT_LIKE : 65;
  export const SQLITE_INDEX_CONSTRAINT_GLOB : 66;
  export const SQLITE_INDEX_CONSTRAINT_REGEXP : 67;
  export const SQLITE_INDEX_CONSTRAINT_NE : 68;
  export const SQLITE_INDEX_CONSTRAINT_ISNOT : 69;
  export const SQLITE_INDEX_CONSTRAINT_ISNOTNULL : 70;
  export const SQLITE_INDEX_CONSTRAINT_ISNULL : 71;
  export const SQLITE_INDEX_CONSTRAINT_IS : 72;
  export const SQLITE_INDEX_CONSTRAINT_FUNCTION : 150;
  export const SQLITE_INDEX_SCAN_UNIQUE : 1;
  export class SQLiteError extends Error {
      constructor(message: any, code: any);
      code: any;
  }
}

/** @ignore */
declare module 'wa-sqlite/dist/wa-sqlite.mjs' {
  function ModuleFactory(): Promise<any>;
  export = ModuleFactory;
}

/** @ignore */
declare module 'wa-sqlite/dist/wa-sqlite-async.mjs' {
  function ModuleFactory(): Promise<any>;
  export = ModuleFactory;
}

/** @ignore */
declare module 'wa-sqlite/src/VFS.js' {
  export const SQLITE_OK: 0;
  export const SQLITE_ERROR: 1;
  export const SQLITE_BUSY: 5;
  export const SQLITE_NOMEM: 7;
  export const SQLITE_READONLY: 8;
  export const SQLITE_IOERR: 10;
  export const SQLITE_IOERR_SHORT_READ: 522;
  export const SQLITE_NOTFOUND: 12;
  export const SQLITE_CANTOPEN: 14;
  export const SQLITE_NOTADB: 26;
  export const SQLITE_ROW: 100;
  export const SQLITE_DONE: 101;
  export const SQLITE_OPEN_READONLY: 1;
  export const SQLITE_OPEN_READWRITE: 2;
  export const SQLITE_OPEN_CREATE: 4;
  export const SQLITE_OPEN_DELETEONCLOSE: 8;
  export const SQLITE_OPEN_EXCLUSIVE: 16;
  export const SQLITE_OPEN_AUTOPROXY: 32;
  export const SQLITE_OPEN_URI: 64;
  export const SQLITE_OPEN_MEMORY: 128;
  export const SQLITE_OPEN_MAIN_DB: 256;
  export const SQLITE_OPEN_TEMP_DB: 512;
  export const SQLITE_OPEN_TRANSIENT_DB: 1024;
  export const SQLITE_OPEN_MAIN_JOURNAL: 2048;
  export const SQLITE_OPEN_TEMP_JOURNAL: 4096;
  export const SQLITE_OPEN_SUBJOURNAL: 8192;
  export const SQLITE_OPEN_SUPER_JOURNAL: 16384;
  export const SQLITE_OPEN_NOMUTEX: 32768;
  export const SQLITE_OPEN_FULLMUTEX: 65536;
  export const SQLITE_OPEN_SHAREDCACHE: 131072;
  export const SQLITE_OPEN_PRIVATECACHE: 262144;
  export const SQLITE_OPEN_WAL: 524288;
  export const SQLITE_OPEN_NOFOLLOW: 16777216;
  export const SQLITE_LOCK_NONE: 0;
  export const SQLITE_LOCK_SHARED: 1;
  export const SQLITE_LOCK_RESERVED: 2;
  export const SQLITE_LOCK_PENDING: 3;
  export const SQLITE_LOCK_EXCLUSIVE: 4;
  export const SQLITE_IOCAP_ATOMIC: 1;
  export const SQLITE_IOCAP_ATOMIC512: 2;
  export const SQLITE_IOCAP_ATOMIC1K: 4;
  export const SQLITE_IOCAP_ATOMIC2K: 8;
  export const SQLITE_IOCAP_ATOMIC4K: 16;
  export const SQLITE_IOCAP_ATOMIC8K: 32;
  export const SQLITE_IOCAP_ATOMIC16K: 64;
  export const SQLITE_IOCAP_ATOMIC32K: 128;
  export const SQLITE_IOCAP_ATOMIC64K: 256;
  export const SQLITE_IOCAP_SAFE_APPEND: 512;
  export const SQLITE_IOCAP_SEQUENTIAL: 1024;
  export const SQLITE_IOCAP_UNDELETABLE_WHEN_OPEN: 2048;
  export const SQLITE_IOCAP_POWERSAFE_OVERWRITE: 4096;
  export const SQLITE_IOCAP_IMMUTABLE: 8192;
  export const SQLITE_IOCAP_BATCH_ATOMIC: 16384;
  export class Base {
    mxPathName: number;
    /**
     * @param {number} fileId
     * @returns {number|Promise<number>}
     */
    xClose(fileId: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {{ size: number, value: Int8Array }} pData
     * @param {number} iOffset
     * @returns {number|Promise<number>}
     */
    xRead(fileId: number, pData: {
        size: number;
        value: Int8Array;
    }, iOffset: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {{ size: number, value: Int8Array }} pData
     * @param {number} iOffset
     * @returns {number|Promise<number>}
     */
    xWrite(fileId: number, pData: {
        size: number;
        value: Int8Array;
    }, iOffset: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {number} iSize
     * @returns {number|Promise<number>}
     */
    xTruncate(fileId: number, iSize: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {*} flags
     * @returns {number|Promise<number>}
     */
    xSync(fileId: number, flags: any): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {{ set: function(number): void }} pSize64
     * @returns {number|Promise<number>}
     */
    xFileSize(fileId: number, pSize64: {
        set: (arg0: number) => void;
    }): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {number} flags
     * @returns {number|Promise<number>}
     */
    xLock(fileId: number, flags: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {number} flags
     * @returns {number|Promise<number>}
     */
    xUnlock(fileId: number, flags: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {{ set: function(number): void }} pResOut
     * @returns {number|Promise<number>}
     */
    xCheckReservedLock(fileId: number, pResOut: {
        set: (arg0: number) => void;
    }): number | Promise<number>;
    /**
     * @param {number} fileId
     * @param {number} flags
     * @param {{ value: Int8Array }} pOut
     * @returns {number|Promise<number>}
     */
    xFileControl(fileId: number, flags: number, pOut: {
        value: Int8Array;
    }): number | Promise<number>;
    /**
     * @param {number} fileId
     * @returns {number|Promise<number>}
     */
    xSectorSize(fileId: number): number | Promise<number>;
    /**
     * @param {number} fileId
     * @returns {number|Promise<number>}
     */
    xDeviceCharacteristics(fileId: number): number | Promise<number>;
    /**
     * @param {string?} name
     * @param {number} fileId
     * @param {number} flags
     * @param {{ set: function(number): void }} pOutFlags
     * @returns {number|Promise<number>}
     */
    xOpen(name: string | null, fileId: number, flags: number, pOutFlags: {
        set: (arg0: number) => void;
    }): number | Promise<number>;
    /**
     *
     * @param {string} name
     * @param {number} syncDir
     * @returns {number|Promise<number>}
     */
    xDelete(name: string, syncDir: number): number | Promise<number>;
    /**
     * @param {string} name
     * @param {number} flags
     * @param {{ set: function(number): void }} pResOut
     * @returns {number|Promise<number>}
     */
    xAccess(name: string, flags: number, pResOut: {
        set: (arg0: number) => void;
    }): number | Promise<number>;
    /**
     * Handle asynchronous operation. This implementation will be overriden on
     * registration by an Asyncify build.
     * @param {function(): Promise<number>} f
     * @returns {Promise<number>}
     */
    handleAsync(f: () => Promise<number>): Promise<number>;
  }
}

/** @ignore */
declare module 'wa-sqlite/src/examples/ArrayModule.js' {
  export class ArrayModule {
    /**
     * @param {SQLiteAPI} sqlite3
     * @param {number} db
     * @param {Array<Array>} rows Table data.
     * @param {Array<string>} columns Column names.
     */
    constructor(sqlite3: any, db: number, rows: Array<any[]>, columns: Array<string>);
    mapCursorToState: Map<any, any>;
    sqlite3: any;
    db: number;
    rows: any[][];
    columns: string[];
    /**
     * @param {number} db
     * @param {*} appData Application data passed to `SQLiteAPI.create_module`.
     * @param {Array<string>} argv
     * @param {number} pVTab
     * @param {{ set: function(string): void}} pzErr
     * @returns {number|Promise<number>}
     */
    xCreate(db: number, appData: any, argv: Array<string>, pVTab: number, pzErr: {
        set: (arg0: string) => void;
    }): number | Promise<number>;
    /**
     * @param {number} db
     * @param {*} appData Application data passed to `SQLiteAPI.create_module`.
     * @param {Array<string>} argv
     * @param {number} pVTab
     * @param {{ set: function(string): void}} pzErr
     * @returns {number|Promise<number>}
     */
    xConnect(db: number, appData: any, argv: Array<string>, pVTab: number, pzErr: {
        set: (arg0: string) => void;
    }): number | Promise<number>;
    /**
     * @param {number} pVTab
     * @param {SQLiteModuleIndexInfo} indexInfo
     * @returns {number|Promise<number>}
     */
    xBestIndex(pVTab: number, indexInfo: any): number | Promise<number>;
    /**
     * @param {number} pVTab
     * @returns {number|Promise<number>}
     */
    xDisconnect(pVTab: number): number | Promise<number>;
    /**
     * @param {number} pVTab
     * @returns {number|Promise<number>}
     */
    xDestroy(pVTab: number): number | Promise<number>;
    /**
     * @param {number} pVTab
     * @param {number} pCursor
     * @returns {number|Promise<number>}
     */
    xOpen(pVTab: number, pCursor: number): number | Promise<number>;
    /**
     * @param {number} pCursor
     * @returns {number|Promise<number>}
     */
    xClose(pCursor: number): number | Promise<number>;
    /**
     * @param {number} pCursor
     * @param {number} idxNum
     * @param {string?} idxStr
     * @param {Array<number>} values
     * @returns {number|Promise<number>}
     */
    xFilter(pCursor: number, idxNum: number, idxStr: string | null, values: Array<number>): number | Promise<number>;
    /**
     * @param {number} pCursor
     * @returns {number|Promise<number>}
     */
    xNext(pCursor: number): number | Promise<number>;
    /**
     * @param {number} pCursor
     * @returns {number|Promise<number>}
     */
    xEof(pCursor: number): number | Promise<number>;
    /**
     * @param {number} pCursor
     * @param {number} pContext
     * @param {number} iCol
     * @returns {number|Promise<number>}
     */
    xColumn(pCursor: number, pContext: number, iCol: number): number | Promise<number>;
    /**
     * @param {number} pCursor
     * @param {{ set: function(number): void}} pRowid
     * @returns {number|Promise<number>}
     */
    xRowid(pCursor: number, pRowid: {
        set: (arg0: number) => void;
    }): number | Promise<number>;
    /**
     * @param {number} pVTab
     * @param {Array<number>} values sqlite3_value pointers
     * @param {{ set: function(number): void}} pRowid
     * @returns {number|Promise<number>}
     */
    xUpdate(pVTab: number, values: Array<number>, pRowid: {
        set: (arg0: number) => void;
    }): number | Promise<number>;
  }
}

/** @ignore */
declare module 'wa-sqlite/src/examples/ArrayAsyncModule.js' {
  import { ArrayModule } from "wa-sqlite/src/examples/ArrayModule.js";
  export class ArrayAsyncModule extends ArrayModule {
    /**
     * @param {function} f
     * @returns {Promise<number>}
     */
    handleAsync(f: Function): Promise<number>;
  }
}

/** @ignore */
declare module 'wa-sqlite/src/examples/IndexedDbVFS.js' {
  import * as VFS from "wa-sqlite/src/VFS.js";
  export class IndexedDbVFS extends VFS.Base {
    /**
     * @param {string} idbName Name of IndexedDB database.
     */
    constructor(idbName?: string);
    name: string;
    mapIdToFile: Map<any, any>;
    cacheSize: number;
    db: any;
    close(): Promise<void>;
    /**
     * Delete a file from IndexedDB.
     * @param {string} name
     */
    deleteFile(name: string): Promise<void>;
    /**
     * Forcibly clear an orphaned file lock.
     * @param {string} name
     */
    forceClearLock(name: string): Promise<void>;
    _getStore(mode?: string): any;
    /**
     * Returns the key for file metadata.
     * @param {string} name
     * @returns
     */
    _metaKey(name: string): string;
    /**
     * Returns the key for file block data.
     * @param {string} name
     * @param {number} index
     * @returns
     */
    _blockKey(name: string, index: number): string;
    _getBlock(store: any, file: any, index: any): Promise<any>;
    _putBlock(store: any, file: any, index: any, blockData: any): void;
    _purgeCache(store: any, file: any, size?: number): void;
    _flushCache(store: any, file: any): Promise<void>;
    _sync(file: any): Promise<void>;
    /**
     * Helper function that deletes all keys greater or equal to `key`
     * provided they start with `prefix`.
     * @param {string} key
     * @param {string} [prefix]
     * @returns
     */
    _delete(key: string, prefix?: string): Promise<any>;
  }
}

/** @ignore */
declare module 'wa-sqlite/src/examples/MemoryVFS.js' {
  import * as VFS from "wa-sqlite/src/VFS.js";
  export class MemoryVFS extends VFS.Base {
    name: string;
    mapNameToFile: Map<any, any>;
    mapIdToFile: Map<any, any>;
  }
}

/** @ignore */
declare module 'wa-sqlite/src/examples/MemoryAsyncVFS.js' {
  import { MemoryVFS } from "wa-sqlite/src/examples/MemoryVFS.js";
  export class MemoryAsyncVFS extends MemoryVFS {
  }
}

/** @ignore */
declare module 'wa-sqlite/src/examples/tag.js' {
  /**
   * Template tag builder. This function creates a tag with an API and
   * database from the same module, then the tag can be used like this:
   * ```
   * const sql = tag(sqlite3, db);
   * const results = await sql`
   *   SELECT 1 + 1;
   *   SELECT 6 * 7;
   * `;
   * ```
   * The returned Promise value contains an array of results for each
   * SQL statement that produces output. Each result is an object with
   * properties `columns` (array of names) and `rows` (array of array
   * of values).
   * @param {SQLiteAPI} sqlite3
   * @param {number} db
   * @returns {function(TemplateStringsArray, ...any): Promise<object[]>}
   */
  export function tag(sqlite3: any, db: number): (arg0: TemplateStringsArray, ...args: any[]) => Promise<object[]>;
}
