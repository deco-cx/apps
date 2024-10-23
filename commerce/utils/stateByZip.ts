const getStateFromZip = (cep: string) => {
  // Remove non-numeric characters
  cep = cep.replace(/\D/g, "");

  // zip range by: https://buscacepinter.correios.com.br/app/faixa_cep_uf_localidade/index.php
  const zipRange = [
    { state: "AC", startRange: 69900000, endRange: 69999999 },
    { state: "AL", startRange: 57000000, endRange: 57999999 },
    { state: "AM", startRange: 69000000, endRange: 69299999 },
    { state: "AM", startRange: 69400000, endRange: 69899999 },
    { state: "AP", startRange: 68900000, endRange: 68999999 },
    { state: "BA", startRange: 40000000, endRange: 48999999 },
    { state: "CE", startRange: 60000000, endRange: 63999999 },
    { state: "DF", startRange: 70000000, endRange: 72799999 },
    { state: "DF", startRange: 73000000, endRange: 73699999 },
    { state: "ES", startRange: 29000000, endRange: 29999999 },
    { state: "GO", startRange: 72800000, endRange: 72999999 },
    { state: "GO", startRange: 73700000, endRange: 76799999 },
    { state: "MA", startRange: 65000000, endRange: 65999999 },
    { state: "MG", startRange: 30000000, endRange: 39999999 },
    { state: "MS", startRange: 79000000, endRange: 79999999 },
    { state: "MT", startRange: 78000000, endRange: 78899999 },
    { state: "PA", startRange: 66000000, endRange: 68899999 },
    { state: "PB", startRange: 58000000, endRange: 58999999 },
    { state: "PE", startRange: 50000000, endRange: 56999999 },
    { state: "PI", startRange: 64000000, endRange: 64999999 },
    { state: "PR", startRange: 80000000, endRange: 87999999 },
    { state: "RJ", startRange: 20000000, endRange: 28999999 },
    { state: "RN", startRange: 59000000, endRange: 59999999 },
    { state: "RO", startRange: 76800000, endRange: 76999999 },
    { state: "RR", startRange: 69300000, endRange: 69399999 },
    { state: "RS", startRange: 90000000, endRange: 99999999 },
    { state: "SC", startRange: 88000000, endRange: 89999999 },
    { state: "SE", startRange: 49000000, endRange: 49999999 },
    { state: "SP", startRange: 1000000, endRange: 19999999 },
    { state: "TO", startRange: 77000000, endRange: 77999999 },
  ];

  const zipCode = parseInt(cep);

  for (const range of zipRange) {
    if (zipCode >= range.startRange && zipCode <= range.endRange) {
      return range.state;
    }
  }

  return "";
};

export default getStateFromZip;
