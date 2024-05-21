<script lang="ts">
    let sEngine = sessionStorage.getItem("sEngine") || "mysql";
    let sUser = sessionStorage.getItem("sUser") || "";
    let sPassword  = sessionStorage.getItem("sPassword") || "";
    let sHost = sessionStorage.getItem("sHost") || "";
    let sDatabase = sessionStorage.getItem("sDatabase") || "";
    let rSchema = sessionStorage.getItem("rSchema") || "";
    let rQuery  = sessionStorage.getItem("rQuery") || "";
    let rResult  = sessionStorage.getItem("rResult") || "";
    async function onSubmitSchema(e: Event) {
        e.preventDefault();
        rSchema = "Loading...";
        let r = await fetch("/api/resolve-schema", {
            body: JSON.stringify({
                engine: sEngine,
                connection: {
                    user: sUser,
                    password: sPassword,
                    host: sHost,
                    database: sDatabase,
                }
            }),
            method: 'post',
            headers: {
                'content-type': 'application/json'
            }
        })
        rSchema = JSON.stringify(await r.json());
        sessionStorage.setItem("sEngine", sEngine);
        sessionStorage.setItem("sUser", sUser);
        sessionStorage.setItem("sPassword", sPassword);
        sessionStorage.setItem("sHost", sHost);
        sessionStorage.setItem("sDatabase", sDatabase);
        sessionStorage.setItem("rSchema", rSchema);
    }
    async function onSubmitQuery(e: Event) {
        e.preventDefault();
        rResult = "Loading...";
        let r = await fetch("/api/solve-query", {
            body: JSON.stringify({
                schema: JSON.parse(rSchema),
                query: rQuery,
            }),
            method: 'post',
            headers: {
                'content-type': 'application/json'
            }
        })
        const t = await r.json();
        console.log(t);
        rResult = t.result;
        sessionStorage.setItem("rResult", rResult);
        sessionStorage.setItem("rQuery", rQuery);
    }
</script>

<main class="container py-3">
    <h1 class="text-center">
        LLM 👉 SQL
    </h1>
    <p class="text-center">
        <small>Greatly ENhanced Textual Analysis and Reporting tool for DEVelopers!</small>
    </p>
    <div class="row">
        <div class="col-4">
            <form on:submit={onSubmitSchema}>
                <select name="engine" class="form-select" bind:value={sEngine}>
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                </select>
                <input
                    type="text"
                    class="form-control"
                    name="user"
                    placeholder="user"
                    bind:value={sUser}
                    required
                />
                <input
                    type="text"
                    class="form-control"
                    name="password"
                    placeholder="password"
                    bind:value={sPassword}
                />
                <input
                    type="text"
                    class="form-control"
                    name="host"
                    placeholder="host"
                    bind:value={sHost}
                    required
                />
                <input
                    type="text"
                    class="form-control"
                    name="database"
                    placeholder="database"
                    bind:value={sDatabase}
                    required
                />
                <button class="btn btn-primary">Get Schema!</button>
            </form>
            <textarea
                class="form-control my-3"
                name=""
                id=""
                placeholder="Schema here"
                readonly
                rows="15"
                bind:value={rSchema}
            ></textarea>
        </div>
        <div class="col-8">
            <form on:submit={onSubmitQuery}>
                <textarea
                    class="form-control"
                    name=""
                    id=""
                    placeholder="Query here"
                    required
                    rows="5"
                bind:value={rQuery}
                ></textarea>
                <button class="btn btn-primary">Query!</button>

            </form>
            <textarea
                class="form-control my-3"
                name=""
                id=""
                placeholder="Result here"
                readonly
                bind:value={rResult}
                rows="15"
            ></textarea>
        </div>
    </div>
</main>

<style>
</style>
