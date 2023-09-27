import uuid


def check_uuid(uuid_to_test: str) -> bool:
    try:
        uuid_obj = uuid.UUID(uuid_to_test, version=4)
    except ValueError:
        return False
    return True