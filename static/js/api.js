//    mini client 
async function apiFetch(url, options = {}) {

    let access = localStorage.getItem("access");
    let refresh = localStorage.getItem("refresh");

    options.headers = {
        ...options.headers,
        "Authorization": "Bearer " + access,
        "Content-Type": "application/json"
    };

    let response = await fetch(url, options);

    // Se token expirou
    if (response.status === 401 && refresh) {

        const refreshResponse = await fetch("/api/token/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refresh: refresh })
        });

        if (refreshResponse.ok) {

            const data = await refreshResponse.json();
            localStorage.setItem("access", data.access);

            // Refaz a requisição original com novo token
            options.headers["Authorization"] = "Bearer " + data.access;
            response = await fetch(url, options);

        } else {
            // Se refresh também falhar → logout
            localStorage.clear();
            window.location.href = "/";
        }
    }

    return response;
};