# users/urls.py
from django.urls import path

from . import views, social_views

from rest_framework import routers
from django.conf.urls import url, include

router = routers.DefaultRouter()
router.register(r'users', views.UserListView.as_view(), base_name="list_user")

urlpatterns = [
    # url(r'^$', include(router.urls)),

    path('accounts/', include('rest_auth.urls')),
    path('accounts/registration/', include('rest_auth.registration.urls')),
    path('login/facebook/', social_views.FacebookLogin.as_view(), name='fb_login'),
    path('login/google/', social_views.GoogleLogin.as_view(), name='gg_login'),
    path('login/github/', social_views.GithubLogin.as_view(), name='gh_login'),
    path('token/token_to_user/',  views.TokenToUser.as_view()),
    path('accounts/register/', views.CustomRegistrationView.as_view(), name="rest_name_register")

]
