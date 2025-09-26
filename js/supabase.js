var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createClient: () => createClient
});
module.exports = __toCommonJS(src_exports);

// src/SupabaseClient.ts
var import_realtime_js = require("@supabase/realtime-js");
var import_gotrue_js = require("@supabase/gotrue-js");
var import_postgrest_js = require("@supabase/postgrest-js");
var import_storage_js = require("@supabase/storage-js");
var DEFAULT_GLOBAL_OPTIONS = {
  db: {
    schema: "public"
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {}
  }
};
var SupabaseClient = class {
  /**
   * Supabase Client.
   *
   * @param supabaseUrl The unique Supabase URL which is supplied via your project.
   * @param supabaseKey The unique Supabase Key which is supplied via your project.
   * @param options.db.schema You can switch in between schemas. The public schema is used by default.
   * @param options.auth.autoRefreshToken Set to "true" to automatically refresh the session every time it expires. Defaults to "true".
   * @param options.auth.persistSession Set to "true" to persist a logged-in session, on a new browser tab or page refresh. Defaults to "true".
   * @param options.auth.detectSessionInUrl Set to "true" to automatically detect the session from a URL. Defaults to "true".
   * @param options.realtime.params The parameters for the realtime connection.
   * @param options.realtime.params.headers The headers for the realtime connection.
   */
  constructor(supabaseUrl, supabaseKey, options) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    if (!supabaseUrl) {
      throw new Error("supabaseUrl is required.");
    }
    if (!supabaseKey) {
      throw new Error("supabaseKey is required.");
    }
    const _options = { ...DEFAULT_GLOBAL_OPTIONS, ...options };
    this.auth = new import_gotrue_js.GoTrueClient({
      url: `${supabaseUrl}/auth/v1`,
      autoRefreshToken: _options.auth.autoRefreshToken,
      persistSession: _options.auth.persistSession,
      detectSessionInUrl: _options.auth.detectSessionInUrl,
      headers: _options.headers,
      storage: _options.auth.storage
    });
    this.realtime = new import_realtime_js.RealtimeClient({
      url: `${supabaseUrl}/realtime/v1`,
      params: {
        apikey: supabaseKey,
        ..._options.realtime.params
      }
    });
    this.rest = new import_postgrest_js.PostgrestClient({
      url: `${supabaseUrl}/rest/v1`,
      headers: _options.headers,
      schema: _options.db.schema,
      fetch: _options.fetch
    });
    this.storage = new import_storage_js.StorageClient({
      url: `${supabaseUrl}/storage/v1`,
      headers: _options.headers,
      fetch: _options.fetch
    });
    this.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        this.realtime.setAuth(session.access_token);
      }
    });
    this.auth.getSession().then((res) => {
      if (res.error) {
        console.error(res.error);
        return;
      }
      if (res.data.session) {
        this.realtime.setAuth(res.data.session.access_token);
      }
    });
  }
  /**
   * Select a table to query from
   * @param table The table to query from
   */
  from(table) {
    const from = this.rest.from(table);
    from.realtime = this.realtime.from(table);
    return from;
  }
  /**
   * Perform a function call.
   * @param fn The function to call.
   * @param params The parameters to pass to the function.
   */
  rpc(fn, params) {
    return this.rest.rpc(fn, params);
  }
};

// src/createClient.ts
var createClient = (supabaseUrl, supabaseKey, options) => {
  return new SupabaseClient(supabaseUrl, supabaseKey, options);
};