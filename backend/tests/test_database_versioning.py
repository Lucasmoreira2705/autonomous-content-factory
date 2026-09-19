import pytest
from sqlalchemy.exc import IntegrityError

from app.database.models import Channel, Idea, Script, ScriptVersion


def version(script_id: str, number: int) -> ScriptVersion:
    return ScriptVersion(
        script_id=script_id,
        version=number,
        title=f"title {number}",
        hook="hook",
        narrative_structure="structure",
        narration="narration",
        raw_output={},
    )


def test_script_versions_are_append_only_by_version_key(db):
    channel = Channel(name="test", niche="test")
    db.add(channel)
    db.commit()
    idea = Idea(channel_id=channel.id, theme="theme")
    db.add(idea)
    db.commit()
    script = Script(idea_id=idea.id)
    db.add(script)
    db.commit()

    db.add(version(script.id, 1))
    db.add(version(script.id, 2))
    db.commit()

    db.add(version(script.id, 2))
    with pytest.raises(IntegrityError):
        db.commit()
