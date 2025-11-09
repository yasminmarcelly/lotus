import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import lotusLogo from "@/assets/lotus-logo.png";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    birthDate: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && (!formData.name || !formData.birthDate)) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    if (!formData.email || !formData.password) {
      toast.error("Por favor, preencha email e senha");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error("Erro ao fazer login: " + error.message);
          }
          return;
        }
        toast.success("Bem-vinda de volta!");
        navigate("/dashboard");
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name, formData.birthDate);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error("Erro ao criar conta: " + error.message);
          }
          return;
        }
        toast.success("Conta criada com sucesso!");
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Erro ao processar requisição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
        <div className="w-32 h-32 mb-6 rounded-full bg-white shadow-glow p-4 flex items-center justify-center">
          <img src={lotusLogo} alt="LOTUS Logo" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          {isLogin ? "Bem-vinda de volta" : "Crie sua conta"}
        </h1>

        <p className="text-center text-muted-foreground mb-8 max-w-sm">
          {isLogin 
            ? "Acesse sua conta para continuar seu acompanhamento" 
            : "Junte-se a nós para começar sua jornada de autocuidado"}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como gostaria de ser chamada?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-foreground">Data de Nascimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {isLogin && (
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Esqueceu sua senha?
            </button>
          )}

          <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
            {loading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
          </Button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Não tem uma conta?{" "}
                  <span className="text-primary font-medium">Cadastre-se</span>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <span className="text-primary font-medium">Entrar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
