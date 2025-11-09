import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  image_url: string | null;
  author: string | null;
  read_time: number | null;
  created_at: string;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadArticle();
    checkIfSaved();
  }, [id]);

  const loadArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Erro ao carregar artigo');
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', id)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      if (isSaved) {
        await supabase
          .from('saved_articles')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', id);
        toast.success('Artigo removido dos salvos');
        setIsSaved(false);
      } else {
        await supabase
          .from('saved_articles')
          .insert({ user_id: user.id, article_id: id });
        toast.success('Artigo salvo com sucesso');
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Erro ao salvar artigo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-calm pb-24">
        <Header title="Artigo" showBack showNotifications />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Card className="animate-pulse">
            <div className="h-64 bg-muted" />
            <CardContent className="pt-6 space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-gradient-calm pb-24">
      <Header title="Artigo" showBack showNotifications />
      
      <main className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <Card className="shadow-medium border-border overflow-hidden">
          {article.image_url && (
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary">{article.category}</Badge>
              
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                )}
                {article.read_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.read_time} min de leitura</span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={toggleSave}
                className="w-full sm:w-auto"
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Salvo' : 'Salvar artigo'}
              </Button>
            </div>

            <div className="prose prose-slate max-w-none">
              {article.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h3 key={index} className="text-xl font-bold text-foreground mt-6 mb-3">
                      {paragraph.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="text-foreground ml-4">
                      {paragraph.substring(2)}
                    </li>
                  );
                }
                if (paragraph.trim() === '') {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="text-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
