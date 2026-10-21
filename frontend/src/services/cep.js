/**
 * Consulta CEP no ViaCEP
 * @param {string} rawCep 
 * @returns {Promise<{street, neighborhood, city, state, zip_code} | null>}
 */
export async function searchCep(rawCep) {
  if (!rawCep) return null;
  const clean = rawCep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) {
      return null;
    }
    return {
      street: data.logradouro || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zip_code: data.cep || clean
    };
  } catch (err) {
    console.warn('Erro ao consultar CEP:', err);
    return null;
  }
}
