-- CreateIndex
CREATE INDEX "cessoes_dente_solicitacao_id_idx" ON "cessoes_dente"("solicitacao_id");

-- CreateIndex
CREATE INDEX "cessoes_dente_dente_id_idx" ON "cessoes_dente"("dente_id");

-- CreateIndex
CREATE INDEX "dentes_status_atual_idx" ON "dentes"("status_atual");

-- CreateIndex
CREATE INDEX "dentes_doador_id_idx" ON "dentes"("doador_id");

-- CreateIndex
CREATE INDEX "dentes_remessa_id_idx" ON "dentes"("remessa_id");

-- CreateIndex
CREATE INDEX "itens_solicitacao_solicitacao_id_idx" ON "itens_solicitacao"("solicitacao_id");

-- CreateIndex
CREATE INDEX "movimentacoes_dente_dente_id_idx" ON "movimentacoes_dente"("dente_id");

-- CreateIndex
CREATE INDEX "solicitacoes_dente_instituicao_id_idx" ON "solicitacoes_dente"("instituicao_id");

-- CreateIndex
CREATE INDEX "solicitacoes_dente_status_idx" ON "solicitacoes_dente"("status");
