const DB_NAME = "gestao_db";
const DB_VERSION = 1;
const STORE_ATIVIDADES = "atividades";
const STORE_SYNC = "fila_sync";

// criando bancos de dados local

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_ATIVIDADES)) {
                db.createObjectStore(STORE_ATIVIDADES, {
                    keyPath: "id"
                });
            }

            if (!db.objectStoreNames.contains(STORE_SYNC)) {
                db.createObjectStore(STORE_SYNC, {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
        };
        request.onsuccess = function() {
            resolve(request.result);
        };
        request.onerror = function() {
            reject(request.error);
        };
    });
}

// função para salvar atividades offline

async function salvarAtividades(atividades) {

    const db = await openDB();
    const tx = db.transaction(STORE_ATIVIDADES, "readwrite");
    const store = tx.objectStore(STORE_ATIVIDADES);

    atividades.forEach(atividade => {
        store.put(atividade);
    });

}

// função para ler atividades offline


async function adicionarFilaSync(acao) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SYNC, "readwrite");
        const store = tx.objectStore(STORE_SYNC);

        const req = store.add(acao);

        req.onsuccess = () => {
            console.log("Adicionado na fila:", acao);
            resolve();
        };

        req.onerror = () => reject(req.error);
    });
}

async function listarAtividadesOffline() {
    const db = await openDB();
    const tx = db.transaction(STORE_ATIVIDADES, "readonly");
    const store = tx.objectStore(STORE_ATIVIDADES);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

