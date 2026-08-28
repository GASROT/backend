function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number) => {
    const total = base
      .split('')
      .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    calcDigit(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcDigit = (base: string, factors: number[]) => {
    const sum = base.split('').reduce((total, digit, index) => {
      return total + Number(digit) * factors[index];
    }, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const firstFactors = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondFactors = [6, ...firstFactors];

  return calcDigit(cnpj.slice(0, 12), firstFactors) === Number(cnpj[12]) &&
    calcDigit(cnpj.slice(0, 13), secondFactors) === Number(cnpj[13]);
}

