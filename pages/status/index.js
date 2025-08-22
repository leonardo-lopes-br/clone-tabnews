import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseMetadata />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const updatedAtText =
    !isLoading && data
      ? new Date(data.updated_at).toLocaleString("pt-BR")
      : "Carregando...";
  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseMetadata() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI);
  const database =
    !isLoading && data
      ? data.dependencies.database
      : {
          version: "Carregando...",
          active_connections: "Carregando...",
          max_connections: "Carregando...",
        };

  return (
    <div>
      <h2>Banco de dados</h2>
      <p>Versão: {database.version}</p>
      <p>Conexões ativas: {database.active_connections}</p>
      <p>Número máximo de conexões: {database.max_connections}</p>
    </div>
  );
}
