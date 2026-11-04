// CPF/CNPJ: o cadastro guarda o texto como foi digitado no painel (com ou sem pontuação),
// então a busca e a comparação são feitas só pelos dígitos.

export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

// Máscara aplicada enquanto o produtor digita: até 11 dígitos é CPF, acima disso CNPJ.
export function formatarDocumento(valor: string) {
  const d = somenteDigitos(valor).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function documentoCompleto(valor: string) {
  const tamanho = somenteDigitos(valor).length;
  return tamanho === 11 || tamanho === 14;
}