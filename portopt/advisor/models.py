from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", User.Role.INVESTOR)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        INVESTOR = "Investor"
        MANAGER = "Manager"
        ADMIN = "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    identifiant = models.CharField(max_length=100, unique=True, default='khalil101')  # ✅ Added Identifiant

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.INVESTOR)
    preferences = models.JSONField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    # Remove username (use email instead)
    username = None
    USERNAME_FIELD = "identifiant"
    REQUIRED_FIELDS = ['email']

    objects = CustomUserManager()

    # 🔥 Fix conflicts with Django's default User model
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_groups",  # ✅ Avoid conflict
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions",  # ✅ Avoid conflict
        blank=True,
    )

    def __str__(self):
        return f"{self.email} ({self.role})"


# ----------------------------
# PORTFOLIO MODEL
# ----------------------------
class Portfolio(models.Model):
    """
    Represents an investment portfolio belonging to a user.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="portfolios")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_value(self):
        """Calculates total invested value."""
        return sum(item.quantity * item.purchase_price for item in self.investments.all())

    def __str__(self):
        return f"Portfolio: {self.name} (User: {self.user.email})"


# ----------------------------
# ASSET MODEL
# ----------------------------
class Asset(models.Model):
    """
    Represents an asset (stock, crypto, ETF, etc.).
    """
    class AssetType(models.TextChoices):
        STOCK = "Stock"
        BOND = "Bond"
        ETF = "ETF"
        CRYPTO = "Crypto"
        COMMODITY = "Commodity"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=AssetType.choices)
    ticker_symbol = models.CharField(max_length=50, blank=True, null=True)
    market = models.CharField(max_length=50, blank=True, null=True)
    current_price = models.DecimalField(max_digits=20, decimal_places=4, default=0)

    def __str__(self):
        return f"{self.name} ({self.type})"


# ----------------------------
# PORTFOLIO-ASSET INTERMEDIATE MODEL
# ----------------------------
class PortfolioAsset(models.Model):
    """
    Tracks asset holdings within a portfolio, including quantity and purchase price.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="investments")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=20, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=20, decimal_places=4)
    purchase_date = models.DateTimeField()
    total_purchase = models.DecimalField(max_digits=20, decimal_places=4, editable=False)

    def save(self, *args, **kwargs):
        # Automatically set total_purchase before saving
        self.total_purchase = self.quantity * self.purchase_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.portfolio.name} - {self.asset.name}: {self.quantity} units"


# -------------------------------------------------------------------
# 4. TRANSACTION MODEL
# -------------------------------------------------------------------
class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        ACHAT = 'Achat', 'Achat'
        VENTE = 'Vente', 'Vente'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    portefeuille = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='transactions')
    actif = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    quantite = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    prix_unitaire = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    montant_total = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    date_transaction = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.actif.nom} x {self.quantite}"


# -------------------------------------------------------------------
# 5. PERFORMANCE MODEL
# -------------------------------------------------------------------
class Performance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    portefeuille = models.OneToOneField(Portfolio, on_delete=models.CASCADE, related_name='performance')
    rendement_1j = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    rendement_1s = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    rendement_1m = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    rendement_1a = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    sharpe_ratio = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    volatilite_historique = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    dernier_calcul = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Performance for portfolio {self.portefeuille.nom}"


# -------------------------------------------------------------------
# 6. RECOMMENDATION MODEL
# -------------------------------------------------------------------
class Recommendation(models.Model):
    class RecommendationType(models.TextChoices):
        ACHAT = 'Achat', 'Achat'
        VENTE = 'Vente', 'Vente'
        REEQUILIBRAGE = 'Reequilibrage', 'Reequilibrage'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    type = models.CharField(max_length=20, choices=RecommendationType.choices)
    actif = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='recommendations')
    justification = models.TextField()
    score_confiance = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # e.g. 0-100
    date_recommandation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} for {self.actif.nom} (User: {self.utilisateur.nom})"


# -------------------------------------------------------------------
# 7. MARKET SIGNAL MODEL
# -------------------------------------------------------------------
class MarketSignal(models.Model):
    class SignalType(models.TextChoices):
        FORTE_VOLATILITE = 'ForteVolatilite', 'Forte Volatilite'
        OPPORTUNITE_ACHAT = 'OpportuniteAchat', 'Opportunite Achat'
        RISQUE_ELEVE = 'RisqueEleve', 'Risque Eleve'
        # etc.

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actif = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='market_signals')
    type = models.CharField(max_length=30, choices=SignalType.choices)
    description = models.TextField()
    date_signal = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} on {self.actif.nom}"


# -------------------------------------------------------------------
# 8. PRICE HISTORY MODEL
# -------------------------------------------------------------------
class PriceHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actif = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='price_history')
    date = models.DateTimeField()
    prix_ouverture = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    prix_fermeture = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    plus_haut = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    plus_bas = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    volume = models.DecimalField(max_digits=20, decimal_places=2, default=0)

    def __str__(self):
        return f"Price history for {self.actif.nom} on {self.date}"
