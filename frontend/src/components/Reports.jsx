import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ChartContainer } from "./ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
   Cell,
} from "recharts";
import { dashboardAPI } from "../services/api";

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Génère des valeurs aléatoires pour chaque section
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Résumé global
  const overview = {
    activeRentals: getRandomInt(10, 50),
    totalRevenue: getRandomInt(100000, 500000),
    totalClients: getRandomInt(30, 200),
    totalVehicles: getRandomInt(40, 80),
  };

  // Statut véhicules
  const vehicleStatus = {
    loue: getRandomInt(10, 40),
    disponible: getRandomInt(10, 40),
    maintenance: getRandomInt(1, 10),
    reserve: getRandomInt(1, 10),
  };

  // Revenus mensuels
  // const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
  //   month: `${i + 1}`,
  //   revenue: getRandomInt(5000, 50000),
  //   count: getRandomInt(5, 30),
  // }));
  const monthlyRevenue = [
  { month: "Jan", revenue: 4000 },
  { month: "Fev", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Avr", revenue: 2780 },
  { month: "Mai", revenue: 2780 },
  { month: "Juin", revenue: 1780 },
  { month: "Juillet", revenue: 1480 },
  { month: "Aout", revenue: 3580 },
  { month: "Sept", revenue: 810 },
  { month: "Oct", revenue: 1000 },
  { month: "Nov", revenue: 2393 },
  { month: "Dec", revenue: 790 },
];

  // Top clients
  const topClients = [
    {_id: 1,
    firstName: `HAYTAM`,
    lastName: `RABA`,
    totalSpent: getRandomInt(10000, 80000),
    totalRentals: getRandomInt(1, 15)},
    {_id: 2,
    firstName: `MOHAMED`,
    lastName: `CHERKAOUI`,
    totalSpent: getRandomInt(10000, 80000),
    totalRentals: getRandomInt(1, 15)},
     {_id: 2,
    firstName: `adham`,
    lastName: `mohamed`,
    totalSpent: getRandomInt(10000, 80000),
    totalRentals: getRandomInt(1, 15)},
  ];
    


  // Nouveaux clients par période
  const newClientsPerPeriod = Array.from({ length: 6 }, (_, i) => ({
    period: `2025-${i + 1}`,
    count: getRandomInt(2, 20),
  }));

  // Véhicules les plus loués
const mostRentedVehicles = [
  { name: "Dacia logan", count: 10 },
  { name: "Dacia logan", count: 10 },
  { name: "Dacia logan", count: 10 },
  { name: "Dacia logan", count: 10 },
  { name: "Dacia Express", count: 8 },
  { name: "Renault Clio", count: 0 },
  { name: "Renault Clio Auto", count: 33 },
  { name: "Renault Kardian", count: 27 },
  { name: "Renault Kardian", count: 14 },
];


  // Locations en cours vs terminées
  const locationStatus = [
    { name: "En cours", value: 10 },
    { name: "Terminée", value: 1 },
  ];

const COLORS = ["#6366f1", "#f59e0b"];

  return (
    <div className="grid gap-6">
      {/* Résumé global */}
      <Card className="p-4">
        <h2 className="font-bold text-lg mb-2"> Résumé global</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-muted-foreground">Véhicules loués</div>
            <div className="font-bold text-xl">{overview.activeRentals}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Revenus totaux</div>
            <div className="font-bold text-xl">
              {overview.totalRevenue.toLocaleString()} DH
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Clients actifs</div>
            <div className="font-bold text-xl">{overview.totalClients}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Taux d’occupation</div>
            <div className="font-bold text-xl">
              {(
                (overview.activeRentals / overview.totalVehicles) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </Card>

      {/*  Rapports financiers */}
      <Card className="p-4">
        <h2 className="font-bold text-lg mb-2">Rapports financiers</h2>
        <ChartContainer config={{ revenue: { color: "#3b82f6" } }}>
          <BarChart data={monthlyRevenue}>
            <XAxis dataKey="month" />
            <YAxis />
            <Bar dataKey="revenue" fill="#2a6ed5ff" />
          </BarChart>
        </ChartContainer>
      </Card>

      {/*  Rapports de location */}
      <Card className="p-4">
        <h2 className="font-bold text-lg mb-2">Rapports de location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground mb-1">
              Véhicules les plus loués
            </div>
            <ul>
              {mostRentedVehicles.map((v) => (
                <li key={v.name} className="flex justify-between">
                  <span>{v.name}</span>
                  <span>{v.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">
              Locations en cours vs terminées
            </div>
            <PieChart width={200} height={200}>
              <Pie
                data={locationStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#6366f1"
                label
              />
     
            </PieChart>
          </div>
        </div>
      </Card>

      {/* Rapports clients */}
      <Card className="p-4">
        <h2 className="font-bold text-lg mb-2"> Rapports clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground mb-1">
              Clients les plus fidèles
            </div>
            <ul>
              {topClients.map((client) => (
                <li key={client._id} className="flex justify-between">
                  <span>
                    {client.firstName} {client.lastName}
                  </span>
                  <span>{client.totalSpent.toLocaleString()} DH</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">
              Nouveaux clients par période
            </div>
            <BarChart width={300} height={200} data={newClientsPerPeriod}>
              <XAxis dataKey="period" />
              <YAxis />
              <Bar dataKey="count" fill="#f43f5e" />
            </BarChart>
          </div>
        </div>
      </Card>

      {/*  Visualisation */}
      <Card className="p-4">
        <h2 className="font-bold text-lg mb-2"> Visualisation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground mb-1">Revenus mensuels</div>
            <ChartContainer config={{ revenue: { color: "#10b981" } }}>
              <LineChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" />
              </LineChart>
            </ChartContainer>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">
              Occupation véhicules
            </div>
            <ChartContainer config={{ status: { color: "#f59e42" } }}>
              <PieChart>
                <Pie
                  data={Object.entries(vehicleStatus).map(
                    ([status, count]) => ({ status, count })
                  )}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#f59e42"
                  label
                />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
