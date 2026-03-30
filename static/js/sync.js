console.log("SYNC NOVO CARREGADO")

// BASE64 → BLOB

function base64ToBlob(base64) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);

    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

// PEGAR FILA (PROMISE)

function getFila(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// SINCRONIZAÇÃO (FIX REAL)

async function sincronizarFila() {
    const db = await openDB();

    // 🔹 1. lê os dados (fora de await bagunçado)
    const txRead = db.transaction(STORE_SYNC, "readonly");
    const storeRead = txRead.objectStore(STORE_SYNC);

    const acoes = await getFila(storeRead);

    console.log("Itens na fila:", acoes.length);

    // 🔹 2. processa um por um
    for (const acao of acoes) {
        try {
            console.log("Processando:", acao);

            // STATUS

            if (acao.tipo === "update_status") {
                await apiFetch(`/api/atividades/${acao.atividade_id}/`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: acao.status
                    })
                });

                console.log("Status OK");
            }

            // FOTO

            if (acao.tipo === "upload_foto") {

                const blob = base64ToBlob(acao.foto);

                const formData = new FormData();
                formData.append("foto_execucao", blob, "foto.jpg");

                const response = await fetch(`/api/atividades/${acao.atividade_id}/`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("access")
                    },
                    body: formData
                });

                if (!response.ok) throw new Error("Erro no upload");
                

                console.log("Foto OK");
            }

            // REMOVE (transação separada!)

            await new Promise((resolve, reject) => {
                const txDelete = db.transaction(STORE_SYNC, "readwrite");
                const storeDelete = txDelete.objectStore(STORE_SYNC);

                storeDelete.delete(acao.id);

                txDelete.oncomplete = () => {
                    console.log("Removido da fila:", acao.id);
                    resolve();
                };

                txDelete.onerror = () => reject(txDelete.error);
            });

        } catch (error) {
            console.log("Erro ao sincronizar:", error);

            continue;
        }
    }
}


















// // Adicionar na fila

// async function adicionarFilaSync(acao) {
//     const db = await openDB();
//     const tx = db.transaction(STORE_SYNC, "readwrite");
//     const store = tx.objectStore(STORE_SYNC);

//     // garante ID automático se não existir
//     store.add({
//         ...acao,
//         criado_em: new Date().toISOString()
//     });
// }   

// // BASE64 -> BLOB

// function base64ToBlob(base64) {
//     const arr = base64.split(',');
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
    
//     let n = bstr.length;
//     const uBarr = new Uint8Array(n);

//     while (n--) {
//         uBarr[n] = bstr.charCodeAt(n);
//     }

//     return new Blob([uBarr], { type: mime});
// }

// // SINCRONIZAR FILA 

// async function sincronizarFila() {
//     const db = await openDB();
//     const tx = db.transaction(STORE_SYNC, "readwrite");
//     const store = tx.objectStore(STORE_SYNC);
//     const request = store.getAll();

//     request.onsuccess = async function() {
//         const acoes = request.result;

//         for (const acao of acoes) {
//             try {
//                 console.log("Sincronizando", acao);

//                 // UPDATE STATUS
//                 if (acao.tipo === "update_status") {
//                     await apiFetch(`/api/atividades/${acao.atividade_id}/`, {
//                         method: "PATCH",
//                         body: JSON.stringify({
//                             status: acao.status
//                         })
//                     });
//                     console.log("Status sincronizado");
//                 }
//                 // UPLOAD FOTO
//                 if (acao.tipo == "upload_foto") {

//                     const blob = base64ToBlob(acao.foto);

//                     const formData = new FormData();
//                     formData.append("foto_execucao", blob, "foto.jpg");

//                     await fetch(`/api/atividades/${acao.atividade_id}/`, {
//                         method: "PATCH",
//                         headers: {
//                             "Authorization": "Bearer " + localStorage.getItem("access")
//                         },
//                         body: formData
//                     });
//                     console.log("Foto sincronizada");
//                 }

//                 // REMOVE DA FILA (APÓS SUCESSO)
//                 store.delete(acao.id);
//             } catch (error) {
//                 console.log("Erro ao sincronizar", error);
//             }
//         }
//     };
// }










