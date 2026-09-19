import pytest

from app.orchestrator.state_machine import (
    InvalidTransitionError,
    PipelineStatus,
    assert_transition,
    can_transition,
)


def test_valid_script_transition():
    assert can_transition(PipelineStatus.IDEA_CREATED, PipelineStatus.SCRIPT_GENERATING)
    assert_transition(PipelineStatus.SCRIPT_REVIEW, PipelineStatus.SCRIPT_APPROVED)


def test_invalid_transition_is_blocked():
    with pytest.raises(InvalidTransitionError):
        assert_transition(PipelineStatus.IDEA_CREATED, PipelineStatus.PUBLISHED)
