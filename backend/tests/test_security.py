"""Unit tests for security utilities — no DB required."""
from datetime import timedelta

import pytest
from jose import JWTError

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_hash_differs_from_plain():
    hashed = get_password_hash("mysecret")
    assert hashed != "mysecret"


def test_verify_password_correct():
    hashed = get_password_hash("correct")
    assert verify_password("correct", hashed) is True


def test_verify_password_wrong():
    hashed = get_password_hash("correct")
    assert verify_password("wrong", hashed) is False


def test_create_access_token_returns_string():
    token = create_access_token(subject="user@example.com")
    assert isinstance(token, str)
    assert len(token) > 10


def test_decode_access_token_sub():
    token = create_access_token(subject="user42")
    payload = decode_access_token(token)
    assert payload["sub"] == "user42"


def test_decode_access_token_additional_claims():
    token = create_access_token(subject="u1", additional_claims={"role": "admin"})
    payload = decode_access_token(token)
    assert payload["role"] == "admin"
    assert payload["sub"] == "u1"


def test_decode_token_has_iat_and_exp():
    token = create_access_token(subject="u1")
    payload = decode_access_token(token)
    assert "iat" in payload
    assert "exp" in payload


def test_expired_token_raises():
    token = create_access_token(subject="u1", expires_delta=timedelta(seconds=-1))
    with pytest.raises(JWTError):
        decode_access_token(token)


def test_invalid_token_raises():
    with pytest.raises(JWTError):
        decode_access_token("not.a.valid.token")
