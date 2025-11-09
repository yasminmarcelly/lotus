import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookmarkPlus, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["Todos", "Sintomas", "Tratamentos", "Alimentação", "Bem-estar"];

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  image_url: string | null;
  read_time: number | null;
  created_at: string;
}

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadArticles();
    loadSavedArticles();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Erro ao carregar artigos');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedArticles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('user_id', user.id);

      if (data) {
        setSavedArticleIds(new Set(data.map(item => item.article_id)));
      }
    } catch (error) {
      console.error('Error loading saved articles:', error);
    }
  };

  const toggleSave = async (articleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      if (savedArticleIds.has(articleId)) {
        await supabase
          .from('saved_articles')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
        
        setSavedArticleIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
        toast.success('Artigo removido dos salvos');
      } else {
        await supabase
          .from('saved_articles')
          .insert({ user_id: user.id, article_id: articleId });
        
        setSavedArticleIds(prev => new Set(prev).add(articleId));
        toast.success('Artigo salvo com sucesso');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Erro ao salvar artigo');
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-calm pb-24">
      <Header title="Artigos & Informações" showBack showNotifications />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        <Card className="shadow-medium border-border bg-gradient-secondary overflow-hidden">
          <CardContent className="p-6">
            <Badge className="mb-3 bg-secondary-dark text-white">Destaque</Badge>
            <h2 className="text-xl font-bold text-secondary-foreground mb-2">
              Como o LOTUS Pode Transformar Seu Cuidado
            </h2>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Descubra como usar todas as funcionalidades da plataforma para um acompanhamento completo.
            </p>
            <button className="flex items-center gap-2 text-secondary-foreground font-medium hover:gap-3 transition-all">
              Ler agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>

        {/* Articles List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Artigos ({filteredArticles.length})
            </h3>
            {savedArticleIds.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {savedArticleIds.size} salvos
              </span>
            )}
          </div>

          {loading ? (
            <Card className="shadow-soft border-border animate-pulse">
              <CardContent className="pt-6 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </CardContent>
            </Card>
          ) : filteredArticles.length === 0 ? (
            <Card className="shadow-soft border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum artigo encontrado com esses critérios.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="shadow-soft border-border hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{article.category}</Badge>
                        {article.read_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {article.read_time} min
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSave(article.id)}
                      className="p-2 rounded-full hover:bg-muted transition-colors shrink-0"
                    >
                      <BookmarkPlus
                        className={cn(
                          "w-5 h-5 transition-colors",
                          savedArticleIds.has(article.id)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/articles/${article.id}`)}
                    className="w-full text-primary hover:text-primary-glow font-medium text-sm flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-primary-light/10 transition-all"
                  >
                    Ler artigo completo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
