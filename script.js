import { db } from "./firebase-config.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const TOTAL_NUMEROS = 100;
let selecionados = [];

const gridDiv = document.getElementById("grid-numeros");
const spanSelecionados = document.getElementById("num-selecionados");
const btnComprar = document.getElementById("btn-comprar");

// INSIRA SEU NÚMERO DE WHATSAPP AQUI (ex: 5511999999999 - com código do país e DDD)
const SEU_WHATSAPP = "5511984336783"; 

async function carregarRifa() {
    try {
        gridDiv.innerHTML = "A carregar números...";
        
        const querySnapshot = await getDocs(collection(db, "rifa"));
        const statusVendas = {};
        querySnapshot.forEach((doc) => {
            statusVendas[doc.id] = doc.data();
        });

        gridDiv.innerHTML = "";

        for (let i = 1; i <= TOTAL_NUMEROS; i++) {
            const numStr = String(i).padStart(3, '0');
            const btn = document.createElement("div");
            btn.classList.add("numero");
            btn.innerText = numStr;

            if (statusVendas[numStr]) {
                btn.classList.add("vendido");
                btn.title = `Vendido para: ${statusVendas[numStr].nome}`;
            } else {
                btn.onclick = () => alternarSelecao(numStr, btn);
            }

            gridDiv.appendChild(btn);
        }
    } catch (error) {
        console.error("Erro ao carregar os números: ", error);
        gridDiv.innerHTML = "Erro ao carregar os números.";
    }
}

function alternarSelecao(num, elemento) {
    const index = selecionados.indexOf(num);
    if (index > -1) {
        selecionados.splice(index, 1);
        elemento.classList.remove("selecionado");
    } else {
        selecionados.push(num);
        elemento.classList.add("selecionado");
    }
    spanSelecionados.innerText = selecionados.length > 0 ? selecionados.join(", ") : "Nenhum";
}

btnComprar.onclick = async () => {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();

    if (selecionados.length === 0) {
        alert("Selecione ao menos um número na grade!");
        return;
    }
    if (!nome || !telefone) {
        alert("Preencha seu nome e WhatsApp!");
        return;
    }

    try {
        btnComprar.innerText = "A guardar reserva...";
        btnComprar.disabled = true;

        for (let num of selecionados) {
            await setDoc(doc(db, "rifa", num), {
                nome: nome,
                telefone: telefone,
                data: new Date().toISOString()
            });
        }

        const numerosTexto = selecionados.join(", ");
        alert("Reserva efetuada com sucesso! Vamos abrir o seu WhatsApp para enviar o comprovativo do PagBank.");

        // Abre o WhatsApp automaticamente com a mensagem pronta
        const mensagem = encodeURIComponent(`Olá! Meu nome é ${nome}. Reservei os números: ${numerosTexto} da Rifa. Segue em anexo o comprovativo do PagBank.`);
        window.open(`https://api.whatsapp.com/send?phone=${SEU_WHATSAPP}&text=${mensagem}`, '_blank');

        selecionados = [];
        document.getElementById("nome").value = "";
        document.getElementById("telefone").value = "";
        btnComprar.innerText = "Reservar e Enviar Comprovativo no WhatsApp";
        btnComprar.disabled = false;
        
        carregarRifa();
    } catch (error) {
        console.error("Erro ao salvar reserva: ", error);
        alert("Ocorreu um erro ao reservar. Tente novamente.");
        btnComprar.innerText = "Reservar e Enviar Comprovativo no WhatsApp";
        btnComprar.disabled = false;
    }
};

carregarRifa();