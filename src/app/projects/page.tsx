"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_PROJECTS = [
  {
    id: "meta-001",
    name: "Meta Ads - Campanha Principal",
    channel: "META",
    accountId: "act_123456",
    description: "Monitorar gastos e conversões do Facebook/Instagram",
  },
  {
    id: "google-001",
    name: "Google Ads - Performance Max",
    channel: "GOOGLE",
    accountId: "123-456-789",
    description: "Acompanhar Performance Max e Search Ads",
  },
  {
    id: "tiktok-001",
    name: "TikTok Ads - E-commerce",
    channel: "TIKTOK",
    accountId: "tt_business_001",
    description: "Monitorar campanhas de e-commerce no TikTok",
  },
  {
    id: "shopee-001",
    name: "Shopee Ads - Seller Center",
    channel: "SHOPEE",
    accountId: "shop_123456",
    description: "Acompanhar anúncios e vendas na Shopee",
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  function handleSelectProject(projectId: string) {
    localStorage.setItem("selectedProject", projectId);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Hergé</h1>
          <p className="text-lg text-neutral-400">Selecione o projeto para monitorar</p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_PROJECTS.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelectProject(project.id)}
              className="text-left p-6 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800 transition-all"
            >
              {/* Channel Badge */}
              <div className="mb-3 inline-block">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300">
                  {project.channel}
                </span>
              </div>

              {/* Project Name */}
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>

              {/* Description */}
              <p className="text-sm text-neutral-400 mb-4">{project.description}</p>

              {/* Account ID */}
              <div className="text-xs text-neutral-500">
                <p className="font-mono">ID: {project.accountId}</p>
              </div>

              {/* Arrow */}
              <div className="mt-4 text-neutral-600">→</div>
            </button>
          ))}
        </div>

        {/* Or create new */}
        <div className="mt-12 p-6 rounded-lg border border-dashed border-neutral-700 text-center">
          <p className="text-neutral-400">
            Não vê seu projeto? <br />
            <span className="text-sm">Configure uma nova conta de ads em Configurações</span>
          </p>
        </div>
      </div>
    </div>
  );
}
