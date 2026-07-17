@echo off
REM ============================================
REM  Herge - Deploy de um clique (NEW)
REM ============================================
cd /d "%~dp0"

echo.
echo [1/4] Limpando locks do git...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\config.lock" del /f /q ".git\config.lock"
if exist ".git\refs\heads\master.lock" del /f /q ".git\refs\heads\master.lock"

echo [2/4] Adicionando arquivos...
git add -A

echo [3/4] Commitando...
git commit -m "feat: painel 5 visoes, dados reais Meta via banco, marcar venda, webhook pagamento"

echo [4/4] Enviando para o GitHub (dispara deploy no Vercel)...
git push origin master

echo.
echo ============================================
echo  Deploy enviado! Producao atualiza em ~2 min: herge.vercel.app
echo ============================================
pause
