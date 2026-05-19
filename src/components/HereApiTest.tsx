// Componente de teste rapido da Here API
// Acesse /teste-here para verificar se a API esta funcionando

import { useState } from "react";
import { MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HereApiTest() {
  const [endereco, setEndereco] = useState("Rua da Paz");
  const [numero, setNumero] = useState("123");
  const [cidade, setCidade] = useState("São Luís");
  const [estado, setEstado] = useState("MA");
  const [cep, setCep] = useState("65057660");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const testar = async () => {
    setLoading(true);
    setErro("");
    setResultado(null);

    try {
      const apiKey = import.meta.env.VITE_HERE_API_KEY;
      console.log("API Key disponivel:", !!apiKey);
      
      if (!apiKey) {
        setErro("VITE_HERE_API_KEY nao configurada no .env");
        setLoading(false);
        return;
      }

      const parts = [numero, endereco, cidade, estado, cep.replace(/\D/g, ""), "Brasil"].filter(Boolean);
      const query = parts.join(", ");
      
      console.log("Query:", query);

      const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
      url.searchParams.set("q", query);
      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("limit", "1");
      url.searchParams.set("lang", "pt-BR");

      const res = await fetch(url.toString());
      console.log("Status:", res.status);

      const data = await res.json();
      console.log("Resposta:", data);

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        setResultado({
          titulo: item.title,
          tipo: item.resultType,
          lat: item.position.lat,
          lng: item.position.lng,
          endereco: item.address,
        });
      } else {
        setErro("Nenhum resultado encontrado");
      }
    } catch (err: any) {
      setErro(err.message || "Erro na chamada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          Teste Here API
        </h1>
        <p className="text-slate-500 mb-6">Verifique se a geocodificacao esta funcionando</p>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Endereco</label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Numero</label>
              <Input value={numero} onChange={e => setNumero(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Cidade</label>
              <Input value={cidade} onChange={e => setCidade(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Estado</label>
              <Input value={estado} onChange={e => setEstado(e.target.value)} maxLength={2} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">CEP</label>
              <Input value={cep} onChange={e => setCep(e.target.value)} />
            </div>
          </div>

          <Button onClick={testar} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Testar Geocodificacao"}
          </Button>

          {erro && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <XCircle className="w-4 h-4" />
              {erro}
            </div>
          )}

          {resultado && (
            <div className="p-4 bg-green-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                Sucesso!
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Endereco:</strong> {resultado.titulo}</p>
                <p><strong>Tipo:</strong> {resultado.tipo}</p>
                <p><strong>Latitude:</strong> {resultado.lat}</p>
                <p><strong>Longitude:</strong> {resultado.lng}</p>
              </div>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono text-slate-600">
                {resultado.lat}, {resultado.lng}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-slate-400">
          <p>API Key: {import.meta.env.VITE_HERE_API_KEY ? "Configurada" : "Nao configurada"}</p>
          <p>Abra o console (F12) para ver logs detalhados</p>
        </div>
      </div>
    </div>
  );
}
