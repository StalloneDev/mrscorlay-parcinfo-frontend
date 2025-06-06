import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Users, Package, Ticket, Shield, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-8">
            <img 
              src="https://www.mrsholdings.com/wp-content/uploads/2016/03/MRS-approved-logo-png-1.png" 
              alt="MRS Holdings Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-5xl font-bold text-amber-900 dark:text-amber-100 mb-6">
            Parc Info
          </h1>
          <p className="text-xl text-amber-800 dark:text-amber-200 mb-8 max-w-2xl mx-auto">
            Système complet de gestion de parc informatique pour optimiser vos ressources IT et simplifier vos opérations
          </p>
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = "/login"}
          >
            Se connecter
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/50">
            <CardHeader>
              <Monitor className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Gestion d'Équipements
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Suivez tous vos équipements informatiques en temps réel
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/50">
            <CardHeader>
              <Users className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Gestion d'Utilisateurs
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Administrez vos employés et leurs accès en toute sécurité
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/50">
            <CardHeader>
              <Ticket className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Système de Tickets
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Gérez les demandes et incidents de façon efficace
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/50">
            <CardHeader>
              <Package className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Inventaire
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Contrôlez votre stock et vos ressources matérielles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/50">
            <CardHeader>
              <Shield className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Gestion de Licences
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Suivez vos licences logicielles et leurs expirations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/50">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Tableau de Bord
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Visualisez vos métriques et performances clés
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="border-amber-200 dark:border-amber-800 bg-white/70 dark:bg-amber-950/70 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Prêt à commencer ?
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Connectez-vous pour accéder à votre espace de gestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => window.location.href = "/login"}
              >
                Accéder au système
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}