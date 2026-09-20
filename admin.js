import { db } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tabelaCompradores = document.getElementById("tabela-compradores");
const btnSortear = document.getElementById("btn-sortear");
const btnZerar = document.getElementById("btn-zerar");
const divResultado = document.getElementById("resultado-sorteio");

let numerosVendidos = [];

async function carregarPainelAdmin() {
    try {
        tabelaCompradores.innerHTML = `<tr><td colspan="4">A carregar compradores...</td></tr>`;
        numerosVendidos = [];

        const querySnapshot = await getDocs(collection(db, "rifa"));
        
        if (querySnapshot.empty) {
            tabelaCompradores.innerHTML = `<tr><td colspan="4">Nenhum número vendido até o momento.</td></tr>`;
            return;
        }

        tabelaCompradores.innerHTML = "";

        querySnapshot.forEach((documento) => {
            const dados = documento.data();
            const numero = documento.id;

            numerosVendidos.push({ numero, ...dados });

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${numero}</strong></td>
                <td>${dados.nome}</td>
                <td>${dados.telefone}</td>
                <td>
                    <button class="btn-cancelar-num" data-numero="${numero}">Liberar Número</button>
                </td>
            `;
            tabelaCompradores.appendChild(tr);
        });

        // Adiciona evento de clique para cada botão de liberar número
        document.querySelectorAll(".btn-cancelar-num").forEach(botao => {
            botao.onclick = (e) => {
                const numParaLiberar = e.target.getAttribute("data-numero");
                liberarNumeroIndividual(numParaLiberar);
            };
        });

    } catch (error) {
        console.error("Erro ao carregar painel admin: ", error);
        tabelaCompradores.innerHTML = `<tr><td colspan="4">Erro ao carregar dados. Verifique o console.</td></tr>`;
    }
}

// Função para cancelar/liberar apenas um número de quem não pagou
async function liberarNumeroIndividual(numero) {
    const confirmacao = confirm(`Deseja cancelar a reserva do número ${numero}? Ele ficará livre novamente no site.`);
    if (!confirmacao) return;

    try {
        await deleteDoc(doc(db, "rifa", numero));
        alert(`O número ${numero} foi liberado com sucesso!`);
        carregarPainelAdmin(); // Recarrega a tabela de compradores
    } catch (error) {
        console.error("Erro ao liberar número: ", error);
        alert("Erro ao tentar liberar o número.");
    }
}

// Lógica para realizar o sorteio
btnSortear.onclick = () => {
    if (numerosVendidos.length === 0) {
        alert("Nenhum número foi vendido ainda para realizar o sorteio!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * numerosVendidos.length);
    const vencedor = numerosVendidos[randomIndex];

    divResultado.innerHTML = `🎉 Ganhador: ${vencedor.nome} (Nº ${vencedor.numero})!`;
};

// Lógica para zerar a rifa inteira
btnZerar.onclick = async () => {
    const confirmacao = confirm("Tem certeza absoluta que deseja ZERAR a rifa? Todos os compradores serão apagados!");
    
    if (!confirmacao) return;

    try {
        btnZerar.innerText = "A apagar...";
        btnZerar.disabled = true;

        const querySnapshot = await getDocs(collection(db, "rifa"));
        const promessasDeExclusao = [];
        querySnapshot.forEach((documento) => {
            const docRef = doc(db, "rifa", documento.id);
            promessasDeExclusao.push(deleteDoc(docRef));
        });

        await Promise.all(promessasDeExclusao);

        alert("Rifa zerada com sucesso!");
        divResultado.innerHTML = "";
        btnZerar.innerText = "Zerar / Reiniciar Rifa";
        btnZerar.disabled = false;

        carregarPainelAdmin();
    } catch (error) {
        console.error("Erro ao zerar a rifa: ", error);
        alert("Ocorreu um erro ao tentar zerar a rifa.");
        btnZerar.innerText = "Zerar / Reiniciar Rifa";
        btnZerar.disabled = false;
    }
};

carregarPainelAdmin();