"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import HeaderWithIcons from "../../components/header-with-icons";
import styles from "./build-budgets.module.css";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Calculator,
  X,
  FileSpreadsheet,
} from "lucide-react";

interface BudgetFormData {
  contratante: string;
  email: string;
  endereco: string;
  estado: string;
  cliente: string;
  celular: string;
  bairro: string;
  cep: string;
  contato: string;
  documento: string;
  cidade: string;
  ie: string;
  numeroProposta: string;
  vendedora: string;
  data: string;
  enderecoObra: string;
  profundidade: string;
  profundidade2: string;
  profundidade3: string;
  totalMetros: string;
  totalMetros2: string;
  totalMetros3: string;
  diametro: string;
  diametro2: string;
  diametro3: string;
  previsaoDias: string;
  unidade: string;
  unidade2: string;
  unidade3: string;
  paymentOption: "diaria" | "porMetro";
  valorDiaria: string;
  valorPorMetro1: string;
  valorPorMetro2: string;
  valorPorMetro3: string;
  taxaTransporte: string;
  segurancaEquipamento: string;
  art: string;
  observacoes: string;
  valorTotalEstimado: string;
}

export default function BuildBudgetsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BudgetFormData>({
    contratante: "",
    email: "",
    endereco: "",
    estado: "",
    cliente: "",
    celular: "",
    bairro: "",
    cep: "",
    contato: "",
    documento: "",
    cidade: "",
    ie: "",
    numeroProposta: "",
    vendedora: "",
    data: "",
    enderecoObra: "",
    profundidade: "",
    profundidade2: "",
    profundidade3: "",
    totalMetros: "",
    totalMetros2: "",
    totalMetros3: "",
    diametro: "",
    diametro2: "",
    diametro3: "",
    previsaoDias: "",
    unidade: "",
    unidade2: "",
    unidade3: "",
    paymentOption: "diaria",
    valorDiaria: "",
    valorPorMetro1: "",
    valorPorMetro2: "",
    valorPorMetro3: "",
    taxaTransporte: "",
    segurancaEquipamento: "",
    art: "",
    observacoes: "",
    valorTotalEstimado: "",
  });

  const [showRow2, setShowRow2] = useState(false);
  const [showRow3, setShowRow3] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.replace(/^(\d{5})(\d{0,3})/, (_m, p1, p2) =>
      p2 ? `${p1}-${p2}` : p1
    );
  };

  const formatCnpjCpf = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits.replace(
        /(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/,
        (_m, a, b, c, d) => {
          let s = a;
          if (b) s += `.${b}`;
          if (c) s += `.${c}`;
          if (d) s += `-${d}`;
          return s;
        }
      );
    } else {
      return digits.replace(
        /(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/,
        (_m, a, b, c, d, e) => {
          let s = a;
          if (b) s += `.${b}`;
          if (c) s += `.${c}`;
          if (d) s += `/${d}`;
          if (e) s += `-${e}`;
          return s;
        }
      );
    }
  };
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_m, a, b, c) => {
        let s = a ? `(${a}` : "";
        if (b) s += `)${b}`;
        if (c) s += `-${c}`;
        return s;
      });
    } else {
      return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_m, a, b, c) => {
        let s = a ? `(${a}` : "";
        if (b) s += `)${b}`;
        if (c) s += `-${c}`;
        return s;
      });
    }
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === "cep") {
      formatted = formatCep(value);
    } else if (name === "documento") {
      formatted = formatCnpjCpf(value);
    } else if (name === "contato" || name === "celular") {
      formatted = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleBack = () => {
    router.push("/home");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => { 
  e.preventDefault();
  setIsSaving(true);  
  setSaveError(null);  
  setSaveSuccess(null); 
  console.log("Enviando para API - Form data:", formData);

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json(); 

    if (!response.ok) {
      throw new Error(result.details || result.error || "Falha ao salvar orçamento");
    }

    setSaveSuccess(result.message || "Orçamento salvo com sucesso!");
    console.log("Orçamento salvo:", result);
    setShowPreview(true);

  } catch (err) {
    console.error("Erro ao salvar orçamento:", err);
    setSaveError((err as Error).message || "Ocorreu um erro ao salvar. Tente novamente.");
  } finally {
    setIsSaving(false);
  }
};

  const addRow = () => {
    if (!showRow2) {
      setShowRow2(true);
    } else if (!showRow3) {
      setShowRow3(true);
    }
  };

  const deleteRow2 = () => {
    setShowRow2(false);
    setShowRow3(false);
    setFormData((prev) => ({
      ...prev,
      profundidade2: "",
      diametro2: "",
      unidade2: "",
      totalMetros2: "",
      profundidade3: "",
      diametro3: "",
      unidade3: "",
      totalMetros3: "",
      valorPorMetro2: "",
      valorPorMetro3: "",
    }));
  };

  const deleteRow3 = () => {
    setShowRow3(false);
    setFormData((prev) => ({
      ...prev,
      profundidade3: "",
      diametro3: "",
      unidade3: "",
      totalMetros3: "",
      valorPorMetro3: "",
    }));
  };

  const handlePrint = () => {
  const headerEl = document.querySelector(`.${styles.previewHeader}`)!;
  const contentEl = document.querySelector(`.${styles.previewContent}`)!;
  if (!headerEl || !contentEl) return;

  const styleTags = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  )
    .map(el => el.outerHTML)
    .join('\n');

  const html = `
    <html>
      <head>
        <title>Orçamento</title>
        ${styleTags}
        <style>
         @page {
            margin: 20mm 10mm;
          }
          body {
            margin: 0; padding: 20px;
            background: white;
          }
          /* garante que nada limite altura */
          * {
            box-sizing: border-box;
            overflow: visible !important;
          }
          /* evita quebra de tabela no meio da linha */
          table { page-break-inside: auto; }
          tr    { page-break-inside: avoid; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        </style>
      </head>
      <body>
        ${headerEl.outerHTML}
        ${contentEl.outerHTML}
      </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=900,height=800');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
    win.close();
  };
};


  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      paymentOption: e.target.value as "diaria" | "porMetro",
    }));
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";

    const number = Number.parseInt(numericValue, 10) / 100;
    return `R$ ${number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatCurrency(value);

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };
  const calculateTotal = () => {
    let total = 0;

    try {
      if (formData.paymentOption === "diaria") {
        const dailyRate =
          Number.parseFloat(
            formData.valorDiaria.replace(/[^\d,]/g, "").replace(",", ".")
          ) || 0;
        const days = Number.parseInt(formData.previsaoDias, 10) || 0;
        total = dailyRate * days;
      } else {
        const rate1 =
          Number.parseFloat(
            formData.valorPorMetro1.replace(/[^\d,]/g, "").replace(",", ".")
          ) || 0;
        const depth1 = Number.parseFloat(formData.profundidade, 10) || 0;
        const units1 = Number.parseInt(formData.unidade, 10) || 0;
        total += rate1 * depth1 * units1;

        if (showRow2) {
          const rate2 =
            Number.parseFloat(
              formData.valorPorMetro2.replace(/[^\d,]/g, "").replace(",", ".")
            ) || 0;
          const depth2 = Number.parseFloat(formData.profundidade2, 10) || 0;
          const units2 = Number.parseInt(formData.unidade2, 10) || 0;
          total += rate2 * depth2 * units2;
        }

        if (showRow3) {
          const rate3 =
            Number.parseFloat(
              formData.valorPorMetro3.replace(/[^\d,]/g, "").replace(",", ".")
            ) || 0;
          const depth3 = Number.parseFloat(formData.profundidade3, 10) || 0;
          const units3 = Number.parseInt(formData.unidade3, 10) || 0;
          total += rate3 * depth3 * units3;
        }
      }

      const transportFee =
        Number.parseFloat(
          formData.taxaTransporte.replace(/[^\d,]/g, "").replace(",", ".")
        ) || 0;
      const securityFee =
        Number.parseFloat(
          formData.segurancaEquipamento.replace(/[^\d,]/g, "").replace(",", ".")
        ) || 0;
      const artFee =
        Number.parseFloat(
          formData.art.replace(/[^\d,]/g, "").replace(",", ".")
        ) || 0;

      total += transportFee + securityFee + artFee;

      return `R$ ${total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (error) {
      console.error("Error calculating total:", error);
      return "R$ 0,00";
    }
  };
  
  const handleSaveExcel = async () => {
  const clienteSlug = formData.cliente.trim().replace(/\s+/g, "_");
  const res = await fetch("/template_orcamento.xlsx");
  console.log("Tentei buscar:", res.url, "– status:", res.status);
  if (!res.ok) throw new Error("Não foi possível carregar o template Excel.");
  const arrayBuffer = await res.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const sheet = workbook.getWorksheet("Planilha1") || workbook.worksheets[0];

  sheet.getCell("C10").value = formData.numeroProposta;
  sheet.getCell("C11").value = formData.contratante;
  sheet.getCell("C12").value = formData.cliente;
  sheet.getCell("J12").value = formData.contato;
  sheet.getCell("C13").value = formData.email;
  sheet.getCell("C14").value = formData.endereco;
  sheet.getCell("J14").value = formData.bairro;
  sheet.getCell("C15").value = formData.cidade;
  sheet.getCell("G15").value = formData.estado;
  sheet.getCell("J15").value = formData.cep;
  sheet.getCell("J13").value = formData.documento;
  sheet.getCell("C16").value = formData.ie || "-";
  sheet.getCell("G13").value = formData.celular;
  sheet.getCell("G10").value = formData.vendedora;
  sheet.getCell("J10").value = new Date(formData.data);
  sheet.getCell("C18").value = formData.enderecoObra;
  sheet.getCell("I23").value = formData.previsaoDias;
  sheet.getCell("D23").value = Number(formData.profundidade);
  sheet.getCell("C23").value = Number(formData.unidade);
  sheet.getCell("B23").value = Number(formData.diametro);
  sheet.getCell("E23").value = Number(formData.totalMetros);
  sheet.getCell("D24").value = Number(formData.profundidade2);
  sheet.getCell("C24").value = Number(formData.unidade2);
  sheet.getCell("B24").value = Number(formData.diametro2);
  sheet.getCell("E24").value = Number(formData.totalMetros2);
  sheet.getCell("D25").value = Number(formData.profundidade3);
  sheet.getCell("C25").value = Number(formData.unidade3);
  sheet.getCell("B25").value = Number(formData.diametro3);
  sheet.getCell("E25").value = Number(formData.totalMetros3);
  sheet.getCell("F22").value = formData.paymentOption;
  sheet.getCell("F23").value = parseFloat(formData.valorDiaria) || 0;
  sheet.getCell("F23").value = parseFloat(formData.valorPorMetro1) || 0;
  sheet.getCell("F24").value = parseFloat(formData.valorPorMetro2) || 0;
  sheet.getCell("F25").value = parseFloat(formData.valorPorMetro3) || 0;
  sheet.getCell("C30").value = parseFloat(formData.taxaTransporte) || 0;
  sheet.getCell("F30").value = parseFloat(formData.segurancaEquipamento) || 0;
  sheet.getCell("J30").value = parseFloat(formData.art) || 0;
  sheet.getCell("B35").value = formData.observacoes;
  sheet.getCell("I32").value = formData.valorTotalEstimado;

  const buf = await workbook.xlsx.writeBuffer();
  saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `orcamento_${clienteSlug}.xlsx`
    );
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const formRef = useRef<HTMLFormElement>(null);
  const handlePreview = (e: React.MouseEvent) => {
  e.preventDefault();
  if (formRef.current?.reportValidity()) {
    const total = calculateTotal();
    setFormData(prev => ({
      ...prev,
      valorTotalEstimado: total
    }));
    setShowPreview(true);
  }
};

  return (
    <div className={styles.container}>
      <HeaderWithIcons />
      <main className={styles.content}>
        <div className={styles.titleContainer}>
          <button
            className={styles.backButton}
            onClick={handleBack}
            aria-label="Voltar para a página inicial"
          >
            <ArrowLeft />
          </button>
          <h1 className={styles.title}>Construa um Orçamento aqui!</h1>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.section}>
            <div className={styles.sectionDivider} />
            <h2 className={styles.sectionTitle}>Dados do Cliente</h2>

            <div className={styles.dataGrid}>
  
              <div className={styles.formGroup}>
                <label htmlFor="contratante" className={styles.label}>
                  Contratante
                </label>
                <input
                  type="text"
                  id="contratante"
                  name="contratante"
                  value={formData.contratante}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Nome do contratante"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cliente" className={styles.label}>
                  Cliente
                </label>
                <input
                  type="text"
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="contato" className={styles.label}>
                  Contato
                </label>
                <input
                  type="tel"
                  id="contato"
                  name="contato"
                  value={formData.contato}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={styles.input}
                  placeholder="Nome do contato"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Email de contato"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endereco" className={styles.label}>
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Endereço completo"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bairro" className={styles.label}>
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Bairro"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cidade" className={styles.label}>
                  Cidade
                </label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Cidade"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="estado" className={styles.label}>
                  Estado
                </label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Estado"
                />
              </div>

          
              <div className={styles.formGroup}>
                <label htmlFor="cep" className={styles.label}>
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={styles.input}
                  placeholder="CEP"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="documento" className={styles.label}>
                  CNPJ/CPF
                </label>
                <input
                  type="text"
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={styles.input}
                  placeholder="CNPJ ou CPF"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="celular" className={styles.label}>
                  Celular
                </label>
                <input
                  type="tel"
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={styles.input}
                  placeholder="Número de celular"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ie" className={styles.label}>
                  IE
                </label>
                <input
                  type="text"
                  id="ie"
                  name="ie"
                  value={formData.ie}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Inscrição Estadual (opcional)"
                />
              </div>
            </div>
          </div>

    
          <div className={styles.section}>
            <div className={styles.sectionDivider}></div>
            <h2 className={styles.sectionTitle}>Dados do Orçamento</h2>
            <div className={styles.dataGrid}>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="numeroProposta" className={styles.label}>
                    Nº Proposta
                  </label>
                  <input
                    type="text"
                    id="numeroProposta"
                    name="numeroProposta"
                    value={formData.numeroProposta}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Número da proposta"
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="vendedora" className={styles.label}>
                    Vendedora
                  </label>
                  <input
                    type="text"
                    id="vendedora"
                    name="vendedora"
                    value={formData.vendedora}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Nome da vendedora"
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="data" className={styles.label}>
                    Data
                  </label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionDivider} />
            <h2 className={styles.sectionTitle}>Dados do Projeto</h2>
            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="enderecoObra" className={styles.label}>
                  Endereço da Obra
                </label>
                <input
                  type="text"
                  id="enderecoObra"
                  name="enderecoObra"
                  value={formData.enderecoObra}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Endereço da obra"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="previsaoDias" className={styles.label}>
                  Previsão de Dias
                </label>
                <input
                  type="number"
                  id="previsaoDias"
                  name="previsaoDias"
                  value={formData.previsaoDias}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Previsão em dias"
                  min="1"
                />
              </div>
            </div>

            <div className={styles.dataGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="profundidade" className={styles.label}>
                  Profundidade
                </label>
                <input
                  type="text"
                  id="profundidade"
                  name="profundidade"
                  value={formData.profundidade}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Profundidade em metros"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="unidade" className={styles.label}>
                  Unidade
                </label>
                <input
                  type="number"
                  id="unidade"
                  name="unidade"
                  value={formData.unidade}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Quantidade de unidades"
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="diametro" className={styles.label}>
                  Diâmetro
                </label>
                <input
                  type="text"
                  id="diametro"
                  name="diametro"
                  value={formData.diametro}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Diâmetro em centímetros"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="totalMetros" className={styles.label}>
                  Total de Metros
                </label>
                <input
                  type="text"
                  id="totalMetros"
                  name="totalMetros"
                  value={formData.totalMetros}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Total de metros"
                />
              </div>
            </div>
            {showRow2 && (
              <div className={styles.dynamicRow}>
                <div className={styles.dataGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="profundidade2" className={styles.label}>
                      Profundidade 2
                    </label>
                    <input
                      type="text"
                      id="profundidade2"
                      name="profundidade2"
                      value={formData.profundidade2}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Profundidade em metros"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="unidade2" className={styles.label}>
                      Unidade 2
                    </label>
                    <input
                      type="number"
                      id="unidade2"
                      name="unidade2"
                      value={formData.unidade2}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Quantidade de unidades"
                      min="1"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="diametro2" className={styles.label}>
                      Diâmetro 2
                    </label>
                    <input
                      type="text"
                      id="diametro2"
                      name="diametro2"
                      value={formData.diametro2}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Diâmetro em centímetros"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="totalMetros2" className={styles.label}>
                      Total de Metros 2
                    </label>
                    <input
                      type="text"
                      id="totalMetros2"
                      name="totalMetros2"
                      value={formData.totalMetros2}
                      required
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Total de metros"
                    />
                  </div>
                </div>
              </div>
            )}

            {showRow3 && (
              <div className={styles.dynamicRow}>
                <div className={styles.dataGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="profundidade3" className={styles.label}>
                      Profundidade 3
                    </label>
                    <input
                      type="text"
                      id="profundidade3"
                      name="profundidade3"
                      value={formData.profundidade3}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Profundidade em metros"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="unidade3" className={styles.label}>
                      Unidade 3
                    </label>
                    <input
                      type="number"
                      id="unidade3"
                      name="unidade3"
                      value={formData.unidade3}
                      required
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Quantidade de unidades"
                      min="1"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="diametro3" className={styles.label}>
                      Diâmetro 3
                    </label>
                    <input
                      type="text"
                      id="diametro3"
                      name="diametro3"
                      value={formData.diametro3}
                      required
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Diâmetro em centímetros"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="totalMetros3" className={styles.label}>
                      Total de Metros 3
                    </label>
                    <input
                      type="text"
                      id="totalMetros3"
                      name="totalMetros3"
                      value={formData.totalMetros3}
                      required
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Total de metros"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.buttonsContainer}>
              {(!showRow2 || !showRow3) && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={addRow}
                >
                  <Plus size={20} />
                </button>
              )}
              {showRow2 && (
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.deleteActionButton}`}
                  onClick={showRow3 ? deleteRow3 : deleteRow2}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div className={styles.paymentSection}>
              <h3 className={styles.paymentTitle}>Opção de Pagamento</h3>

              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="diaria"
                    name="paymentOption"
                    value="diaria"
                    checked={formData.paymentOption === "diaria"}
                    onChange={handleRadioChange}
                    className={styles.radioInput}
                  />
                  <label htmlFor="diaria" className={styles.radioLabel}>
                    Diária
                  </label>
                </div>

                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="porMetro"
                    name="paymentOption"
                    value="porMetro"
                    checked={formData.paymentOption === "porMetro"}
                    onChange={handleRadioChange}
                    className={styles.radioInput}
                  />
                  <label htmlFor="porMetro" className={styles.radioLabel}>
                    Por Metro
                  </label>
                </div>
              </div>
              {formData.paymentOption === "diaria" ? (
                <div className={styles.dataGrid}>
                  <div className={styles.column}>
                    <div className={styles.formGroup}>
                      <label htmlFor="valorDiaria" className={styles.label}>
                        Valor Diária
                      </label>
                      <input
                        type="text"
                        id="valorDiaria"
                        name="valorDiaria"
                        value={formData.valorDiaria}
                        onChange={handleCurrencyChange}
                        required={formData.paymentOption === "diaria"}
                        className={styles.input}
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.dataGrid}>
                  <div className={styles.column}>
                    <div className={styles.formGroup}>
                      <label htmlFor="valorPorMetro1" className={styles.label}>
                        Valor por Metro
                      </label>
                      <input
                        type="text"
                        id="valorPorMetro1"
                        name="valorPorMetro1"
                        value={formData.valorPorMetro1}
                        onChange={handleCurrencyChange}
                        required={formData.paymentOption === "porMetro"}
                        className={styles.input}
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </div>
                  <div className={styles.column}>
                    {showRow2 && (
                      <div className={styles.formGroup}>
                        <label
                          htmlFor="valorPorMetro2"
                          className={styles.label}
                        >
                          Valor por Metro 2
                        </label>
                        <input
                          type="text"
                          id="valorPorMetro2"
                          name="valorPorMetro2"
                          value={formData.valorPorMetro2}
                          onChange={handleCurrencyChange}
                          required={
                            formData.paymentOption === "porMetro" && showRow2
                          }
                          className={styles.input}
                          placeholder="R$ 0,00"
                        />
                      </div>
                    )}
                  </div>
                  <div className={styles.column}>
                    {showRow3 && (
                      <div className={styles.formGroup}>
                        <label
                          htmlFor="valorPorMetro3"
                          className={styles.label}
                        >
                          Valor por Metro 3
                        </label>
                        <input
                          type="text"
                          id="valorPorMetro3"
                          name="valorPorMetro3"
                          value={formData.valorPorMetro3}
                          onChange={handleCurrencyChange}
                          required={
                            formData.paymentOption === "porMetro" && showRow3
                          }
                          className={styles.input}
                          placeholder="R$ 0,00"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionDivider}></div>
            <h2 className={styles.sectionTitle}>Custos Adicionais</h2>

            <div className={styles.dataGrid}>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="taxaTransporte" className={styles.label}>
                    Taxa de Transporte
                  </label>
                  <input
                    type="text"
                    id="taxaTransporte"
                    name="taxaTransporte"
                    value={formData.taxaTransporte}
                    onChange={handleCurrencyChange}
                    className={styles.input}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label
                    htmlFor="segurancaEquipamento"
                    className={styles.label}
                  >
                    Segurança do Equipamento
                  </label>
                  <input
                    type="text"
                    id="segurancaEquipamento"
                    name="segurancaEquipamento"
                    value={formData.segurancaEquipamento}
                    onChange={handleCurrencyChange}
                    className={styles.input}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="art" className={styles.label}>
                    ART
                  </label>
                  <input
                    type="text"
                    id="art"
                    name="art"
                    value={formData.art}
                    onChange={handleCurrencyChange}
                    className={styles.input}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionDivider}></div>
            <h2 className={styles.sectionTitle}>Observações</h2>

            <div className={styles.formGroup}>
              <label htmlFor="observacoes" className={styles.label}>
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Observações adicionais sobre o orçamento"
                rows={4}
              />
            </div>
          </div>
          <div className={styles.totalSection}>
            <div className={styles.totalLabel}>Valor Total Estimado:</div>
            <div className={styles.totalValue}>{calculateTotal()}</div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              onClick={handlePreview}
            >
              <FileText size={20} />
              Visualizar Orçamento
            </button>
          </div>
        </form>
        {showPreview && (
          <div className={`${styles.modalOverlay} ${styles.printWrapper}`}>
            <div className={styles.previewModal}>
              <div className={styles.previewHeader}>
                <h2>Visualização do Orçamento</h2>
                <button className={styles.closeButton} onClick={closePreview}>
                  <X size={24} />
                </button>
              </div>
              <div className={styles.previewContent}>
                <div className={styles.previewSection}>
                  <h3>Dados do Cliente</h3>
                  <div className={styles.previewGrid}>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Contratante:</span>
                      <span className={styles.previewValue}>
                        {formData.contratante}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Cliente:</span>
                      <span className={styles.previewValue}>
                        {formData.cliente}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Contato:</span>
                      <span className={styles.previewValue}>
                        {formData.contato}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Email:</span>
                      <span className={styles.previewValue}>
                        {formData.email}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Celular:</span>
                      <span className={styles.previewValue}>
                        {formData.celular}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>CNPJ/CPF:</span>
                      <span className={styles.previewValue}>
                        {formData.documento}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Endereço:</span>
                      <span className={styles.previewValue}>
                        {formData.endereco}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Bairro:</span>
                      <span className={styles.previewValue}>
                        {formData.bairro}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Cidade:</span>
                      <span className={styles.previewValue}>
                        {formData.cidade}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Estado:</span>
                      <span className={styles.previewValue}>
                        {formData.estado}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>CEP:</span>
                      <span className={styles.previewValue}>
                        {formData.cep}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>IE:</span>
                      <span className={styles.previewValue}>
                        {formData.ie || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3>Dados do Orçamento</h3>
                  <div className={styles.previewGrid}>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Nº Proposta:</span>
                      <span className={styles.previewValue}>
                        {formData.numeroProposta}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Vendedora:</span>
                      <span className={styles.previewValue}>
                        {formData.vendedora}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Data:</span>
                      <span className={styles.previewValue}>
                        {formData.data}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3>Dados do Projeto</h3>
                  <div className={styles.previewGrid}>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        Endereço da Obra:
                      </span>
                      <span className={styles.previewValue}>
                        {formData.enderecoObra}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        Total de Metros:
                      </span>
                      <span className={styles.previewValue}>
                        {formData.totalMetros}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        Previsão de Dias:
                      </span>
                      <span className={styles.previewValue}>
                        {formData.previsaoDias}
                      </span>
                    </div>
                  </div>

                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Profundidade</th>
                        <th>Diâmetro</th>
                        <th>Unidade</th>
                        <th>Total de Metros</th>
                        {formData.paymentOption === "porMetro" && (
                          <th>Valor por Metro</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formData.profundidade}</td>
                        <td>{formData.diametro}</td>
                        <td>{formData.unidade}</td>
                        <td>{formData.totalMetros}</td>
                        {formData.paymentOption === "porMetro" && (
                          <td>{formData.valorPorMetro1}</td>
                        )}
                      </tr>
                      {showRow2 && (
                        <tr>
                          <td>{formData.profundidade2}</td>
                          <td>{formData.diametro2}</td>
                          <td>{formData.unidade2}</td>
                          <td>{formData.totalMetros2}</td>
                          {formData.paymentOption === "porMetro" && (
                            <td>{formData.valorPorMetro2}</td>
                          )}
                        </tr>
                      )}
                      {showRow3 && (
                        <tr>
                          <td>{formData.profundidade3}</td>
                          <td>{formData.diametro3}</td>
                          <td>{formData.unidade3}</td>
                          <td>{formData.totalMetros3}</td>
                          {formData.paymentOption === "porMetro" && (
                            <td>{formData.valorPorMetro3}</td>
                          )}
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {formData.paymentOption === "diaria" && (
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Valor Diária:</span>
                      <span className={styles.previewValue}>
                        {formData.valorDiaria}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.previewSection}>
                  <h3>Custos Adicionais</h3>
                  <div className={styles.previewGrid}>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        Taxa de Transporte:
                      </span>
                      <span className={styles.previewValue}>
                        {formData.taxaTransporte || "R$ 0,00"}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        Segurança do Equipamento:
                      </span>
                      <span className={styles.previewValue}>
                        {formData.segurancaEquipamento || "R$ 0,00"}
                      </span>
                    </div>
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>ART:</span>
                      <span className={styles.previewValue}>
                        {formData.art || "R$ 0,00"}
                      </span>
                    </div>
                  </div>
                </div>

                {formData.observacoes && (
                  <div className={styles.previewSection}>
                    <h3>Observações</h3>
                    <p className={styles.previewObservations}>
                      {formData.observacoes}
                    </p>
                  </div>
                )}

                <div className={styles.previewTotal}>
                  <span className={styles.previewTotalLabel}>
                    Valor Total Estimado:
                  </span>
                  <span className={styles.previewTotalValue}>
                    {calculateTotal()}
                  </span>
                </div>

                <div className={styles.previewActions}>
                  <button
                    type="button"
                    className={styles.previewPrintButton}
                    onClick={handlePrint}
                  >
                    <FileText size={20} />
                    Imprimir Orçamento
                  </button>

                  <button
                    type="button"
                    className={styles.previewPrintButton}
                    onClick={handleSaveExcel}
                    disabled={!formData.cliente.trim()}
                  >
                    <FileSpreadsheet size={20} />
                    Salvar no Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
