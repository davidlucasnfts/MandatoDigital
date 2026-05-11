# Guia de Testes Locais — MandatoDigital

> David, este é o seu manual. Leia uma vez, depois só consulte quando esquecer.

---

## O que você precisa saber

Seu projeto tem **duas partes**:
1. **Frontend** — as telas (React), roda no navegador
2. **Backend** — a API (tRPC/Hono), roda no servidor

Para testar local, você precisa rodar **as duas** ou usar um "atalho".

---

## Método 1: Live Server (só frontend) — MAIS FÁCIL

Use quando quer ver **só as telas**, sem testar login/salvamento no banco.

### Passo a passo:

1. **Instale a extensão "Live Server" no VS Code:**
   - Aperte `Ctrl+Shift+X` (extensões)
   - Busque `Live Server` (autor: Ritwick Dey)
   - Clique em **Install**

2. **Build o projeto primeiro:**
   ```bash
   npm run build
   ```

3. **Clique com botão direito no `index.html`** → **"Open with Live Server"**

4. **O navegador abre sozinho** em `http://127.0.0.1:5500`

### ⚠️ Limitação:
- Login não funciona
- Salvar dados no banco não funciona
- Serve só pra ver layout, cores, posição de botões

---

## Método 2: Vite Dev Server (frontend + backend) — RECOMENDADO

Use quando quer testar **tudo funcionando** (login, cadastro, salvamento).

### Passo a passo:

1. **Abra o terminal no VS Code:** `Ctrl + `` `

2. **Rode o comando:**
   ```bash
   npm run dev
   ```

3. **Aguarde** aparecer algo assim:
   ```
   VITE v5.x  ready in 800 ms
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.x.x:5173/
   ```

4. **Segure `Ctrl` e clique no link** `http://localhost:5173/` — abre no navegador

### O que acontece por trás:
- O Vite serve o frontend em `localhost:5173`
- As chamadas de API vão pro Supabase de verdade (produção)
- **Login funciona, banco funciona, tudo funciona**

### Para parar:
- No terminal, aperte `Ctrl + C`

---

## Método 3: Preview de Produção (testar build final)

Use quando quer ver **como vai ficar no ar** antes de deployar.

```bash
npm run build    # gera a pasta dist/
npm run preview  # abre em http://localhost:4173
```

---

## Comparativo Rápido

| Método | Comando/Como | Backend funciona? | Quando usar |
|--------|-------------|-------------------|-------------|
| Live Server | Botão direito no `index.html` | ❌ Não | Só layout visual |
| **Vite Dev** | `npm run dev` | ✅ Sim (Supabase real) | **Padrão — use este** |
| Preview | `npm run preview` | ⚠️ Parcial | Testar build antes de deploy |

---

## Comandos úteis no terminal

```bash
# Rodar o projeto (use este 99% das vezes)
npm run dev

# Verificar se código tá ok (types)
npm run check

# Rodar testes
npm run test

# Build pra produção
npm run build

# Parar qualquer processo rodando
Ctrl + C
```

---

## Problemas comuns

### "Port already in use"
O Vite tenta usar a porta 5173 mas ela tá ocupada.
**Solução:** Ele automaticamente tenta 5174, 5175... Só olhe o link que aparece no terminal.

### "Cannot find module"
Alguém instalou uma biblioteca nova e você não tem.
**Solução:**
```bash
npm install
```

### Página branca / erro estranho
**Solução:**
```bash
npm run check    # vê se tem erro de TypeScript
npm run build    # vê se builda sem erro
```

---

## Resumo pra gravar

> **Sempre que for testar:** abra o terminal → digite `npm run dev` → segure Ctrl e clique no link.

É só isso. Não precisa de Live Server pra este projeto — o Vite já faz tudo.
