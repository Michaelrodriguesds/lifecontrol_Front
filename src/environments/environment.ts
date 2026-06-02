export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',

  // ⚠️ PROBLEMA CORRIGIDO:
  // devMode: true fazia o authGuard deixar QUALQUER pessoa entrar sem token.
  // Em desenvolvimento local você pode manter true para testar sem login,
  // mas em produção (environment.prod.ts) já está false — o que é correto.
  // Aqui mantemos false para que o comportamento seja idêntico ao produção.
  devMode: false,
};
