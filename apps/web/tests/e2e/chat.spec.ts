import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('conversa demonstrativa responde e é retomada após recarregar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Uma conversa/ })).toBeVisible();
  await page.getByRole('button', { name: 'Concordar e começar' }).click();
  const composer = page.getByRole('textbox', { name: 'Digite sua mensagem' });
  await expect(composer).toBeEnabled({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Quais são os cursos disponíveis?' }).click();
  await expect(page.getByText(/Ainda não tenho uma fonte oficial conectada/)).toBeVisible({ timeout: 15_000 });
  // The first streamed delta is visible before the assistant response is committed to PostgreSQL.
  await expect(composer).toBeEnabled({ timeout: 10_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(composer).toBeEnabled({ timeout: 20_000 });
  await expect(page.getByText(/Ainda não tenho uma fonte oficial conectada/)).toBeVisible({ timeout: 15_000 });
});

test('não produz rolagem horizontal nos breakpoints acordados', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Concordar e começar' }).click();
  await expect(page.getByRole('textbox', { name: 'Digite sua mensagem' })).toBeEnabled({ timeout: 20_000 });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.document, `scroll horizontal em ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test('a rota administrativa começa com autenticação', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Entrar no painel' })).toBeVisible();
  await expect(page.getByLabel('Senha')).toHaveAttribute('type', 'password');
});

test('a tela inicial não apresenta violações críticas ou sérias de acessibilidade', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Concordar e começar' }).click();
  await expect(page.getByRole('textbox', { name: 'Digite sua mensagem' })).toBeEnabled({ timeout: 20_000 });
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
  expect(serious).toEqual([]);
});

test('widget funciona em um host com estilos conflitantes', async ({ page }) => {
  await page.goto('http://localhost:4174/demo-host.html');
  await page.getByRole('button', { name: 'Abrir conversa com a Néia' }).click();
  const frame = page.frameLocator('iframe[title="Conversa com a Néia"]');
  await expect(frame.getByRole('heading', { name: 'Sua conversa, com transparência.' })).toBeVisible({ timeout: 20_000 });
  await frame.getByRole('button', { name: /Concordar e começar/ }).click();
  await expect(frame.getByRole('textbox', { name: 'Digite sua mensagem' })).toBeEnabled({ timeout: 20_000 });
  await frame.getByRole('button', { name: 'Minimizar conversa' }).click();
  await expect(page.getByRole('button', { name: 'Abrir conversa com a Néia' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir conversa com a Néia' }).click();
  await expect(frame.getByRole('textbox', { name: 'Digite sua mensagem' })).toBeEnabled({ timeout: 10_000 });
  await frame.getByRole('button', { name: 'Como entrar em contato?' }).click();
  await expect(frame.getByText(/Ainda não tenho uma fonte oficial conectada/)).toBeVisible({ timeout: 15_000 });
  await frame.getByRole('button', { name: 'Fechar conversa' }).click();
  await expect(page.getByRole('button', { name: 'Abrir conversa com a Néia' })).toBeVisible();
});

test('instalação anterior do widget continua válida com bundle, atributos e ID legados', async ({ page }) => {
  await page.goto('http://localhost:4174/demo-host-legacy.html');
  await page.getByRole('button', { name: 'Abrir conversa com a Néia' }).click();
  const frame = page.frameLocator('iframe[title="Conversa com a Néia"]');
  await expect(frame.getByRole('heading', { name: 'Sua conversa, com transparência.' })).toBeVisible({ timeout: 20_000 });
  await frame.getByRole('button', { name: /Concordar e começar/ }).click();
  await expect(frame.getByRole('textbox', { name: 'Digite sua mensagem' })).toBeEnabled({ timeout: 20_000 });
  await frame.getByRole('button', { name: 'Fechar conversa' }).click();
  await expect(page.getByRole('button', { name: 'Abrir conversa com a Néia' })).toBeVisible();
});
