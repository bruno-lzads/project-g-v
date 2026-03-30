// funções para carregar atividades

async function carregarAtividades() {

    try {

        const response = await apiFetch("/api/atividades/minhas_semana/");
        const atividades = await response.json();
        await salvarAtividades(atividades);
        renderizarAtividades(atividades);

    } catch (error) {
        console.log("Offline. Carregando do banco local");
        const atividades = await listarAtividadesOffline();
        renderizarAtividades(atividades);
    }
}

// função para renderizar atividades

function renderizarAtividades(atividades) {
    const container = document.getElementById("lista-atividades");
    container.innerHTML= "";

    atividades.forEach(atividade => {

        let corStatus = "secondary";

        if (atividade.status === "pendente") corStatus = "warning";
        if (atividade.status === "andamento") corStatus = "primary";
        if (atividade.status === "concluido") corStatus = "success";
        if (atividade.status === "cancelado") corStatus = "danger";

        const card = document.createElement("div");
        card.className = "card shadow-sm mb-3";

        card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between">
                <h6 class="fw-bold">Chamado #${atividade.numero_chamdo}</h6>

                <span class="badge bg-${corStatus}">
                    ${formatarStatus(atividade.status)}
                </span>
            </div>
            
            <p class="mt-2 mb-1">
                ${atividade.descricao}
            </p>

            <small class="text-muted">
                Disciplina:${atividade.desciplina} <br>
                Previsão:${atividade.data_prog} <br>
                Horas:${atividade.hh_previstas}
            </small>

            <div class="mt-3 d-flex gap-2">
                ${atividade.status !== "concluido" ? `
                <button class="btn btn-sm btn-outline-primary" onclick="abrirCamera(${atividade.id})">
                    📷 Foto
                </button>

                <select
                class="form-select form-select-sm mt-2 border-primary"
                onchange="atualizarStatus(${atividade.id}, this.value)">
                    <option value="">Alterar status</option>
                    <option value="pendente" ${atividade.status === "pendente" ? "selected" : ""}>Pendente</option>
                    <option value="andamento"${atividade.status === "andamento" ? "selected" : ""}>Em andamento</option>
                    <option value="concluido"${atividade.status === "concluido" ? "selected" : ""}>Concluído</option>
                    <option value="cancelado"${atividade.status === "cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
                ` : ""}

            </div>

        </div>
        `;
        container.appendChild(card);
    });
}


// status

async function atualizarStatus(id, status) {
    if (!status) return;

    try {
        await apiFetch(`/api/atividades/${id}/`, {
            method: "PATCH",
            body: JSON.stringify({status: status}),
        });

        mostrarMensagem("Status atualizado!");
        carregarAtividades();
        // atualizarStatusLocal(id, status);

    } catch (error) {
        mostrarMensagem("📶🛜Offline. Será sincronizado depois.");
        await adicionarFilaSync({
            tipo: "update_status",
            atividade_id: id,
            status: status,
        });
        // atualizarStatusLocal(id, status);
    }
}

// function atualizarStatusLocal(id, novoStatus) {
//     const card = document.querySelector(`[data-id="${id}"]`);
//     if (!card) return;

//     const badge = card.querySelector(".badge");

//     let corStatus = "secondary";

//     if (novoStatus === "pendente") corStatus = "warning";
//     if (novoStatus === "andamento") corStatus = "primary";
//     if (novoStatus === "concluido") corStatus = "success";
//     if (novoStatus === "cancelado") corStatus = "danger";

//     badge.className = `badge bg-${corStatus}`;
//     badge.innerText = formatarStatus(novoStatus);
// }

function formatarStatus(status) {
    status = status.toLowerCase();

    if (status === "pendente") return "Pendente";
    if (status === "andamento") return "Em andamento";
    if (status === "concluido") return "Concluído";
    if (status === "cancelado") return "Cancelado";

    return status;
}

// Foto (Câmera)

function abrirCamera(id) {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment"); //abre a câmera traseira no celular
    //input.capture = "environment"; //abre a câmera traseira no celular

    input.style.display = "none";

    document.body.appendChild(input);

    input .addEventListener("change", function(event) {
        const file = event.target.files[0];

        if (file) {
            enviarFoto(id, file);
        }

        document.body.removeChild(input);
    });

    input.click();
}

// Upload foto + offline

async function enviarFoto(id, file) {
    const formData = new FormData();
    formData.append("foto_execucao", file);

    try {
        await fetch(`/api/atividades/${id}/`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access")
            },
            body: formData
        });

        console.log("Foto enviada com sucesso");
        
    } catch (error) {
        console.log("Offline. Salvando na fila...");
        
        const base64 = await fileToBase64(file);

        await adicionarFilaSync({
            tipo: "upload_foto",
            atividade_id: id,
            foto: base64,
        });

        mostrarMensagem("Foto salva offline", "warning");
    }
}

// util

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file)
    });
}


// mostrar mensagem

function mostrarMensagem(msg, tipo="success") {
    const toast = document.createElement("div");

    toast.className = `toast align-items-center text-bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3 show`;

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${msg}
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}


// função para concluir a atividade

async function concluirAtividade(id) {
    try {
        await apiFetch(`/api/atividades/${id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "concluido",
            })
        });

        console.log("Atividade concluída");

        carregarAtividades();

    } catch (error) {
        console.log("Offline. Salvando na fila...");

        await adicionarFilaSync({
            tipo: "update_status",
            atividade_id: id,
            status: "concluido",
        });
    }
}

